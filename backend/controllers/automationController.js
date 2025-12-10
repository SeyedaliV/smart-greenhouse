import Device from '../models/deviceModel.js';
import Sensor from '../models/sensorModel.js';
import Zone from '../models/zoneModel.js';
import { createAuditLog } from './auditLogController.js';

// Simple automation tick: checks sensors vs zone settings and toggles devices in AUTO style.
export const runAutomationTick = async (req, res) => {
  try {
    const [devices, sensors, zones] = await Promise.all([
      Device.find().populate('zone'),
      Sensor.find().populate('zone'),
      Zone.find(),
    ]);

    const zoneByName = new Map(zones.map((z) => [z.name, z]));
    const devicesByZone = new Map();

    devices.forEach((d) => {
      const key = d.zone || 'GLOBAL';
      if (!devicesByZone.has(key)) devicesByZone.set(key, []);
      devicesByZone.get(key).push(d);
    });

    const events = [];

    const scheduleDeviceChange = async (
      device,
      newStatus,
      reason,
      metric,
      metricValue,
      targetRange,
    ) => {
      if (!device || device.status === newStatus) return null;

      const updated = await Device.findByIdAndUpdate(
        device._id,
        { status: newStatus, lastAction: new Date() },
        { new: true, runValidators: true },
      );

      await createAuditLog({
        req,
        actionType: 'DEVICE_CONTROL',
        entityType: 'Device',
        entityId: updated._id.toString(),
        entityName: updated.name,
        description: `AUTO: ${reason}`,
        meta: {
          auto: true,
          newStatus,
          metric,
          metricValue,
          targetRange,
          zone: updated.zone,
        },
      });

      const event = {
        deviceId: updated._id.toString(),
        deviceName: updated.name,
        zone: updated.zone,
        newStatus,
        reason,
        metric,
        metricValue,
        targetRange,
      };
      events.push(event);
      return updated;
    };

    for (const sensor of sensors) {
      const zoneName = sensor.zone;
      const zone = zoneByName.get(zoneName);
      if (!zone) continue;

      const zoneDevices = devicesByZone.get(zoneName) || [];

      // Soil moisture → water pump
      if (sensor.type === 'soilMoisture' && zone.settings?.soilMoisture) {
        const range = zone.settings.soilMoisture;
        const value = sensor.value;

        const pump = zoneDevices.find((d) => d.type === 'waterPump');

        if (typeof value === 'number' && pump) {
          if (value < range.min) {
            await scheduleDeviceChange(
              pump,
              'ON',
              `Soil moisture low in ${zoneName}, starting irrigation`,
              'soilMoisture',
              value,
              `${range.min}-${range.max}%`,
            );
          } else if (value > range.max) {
            await scheduleDeviceChange(
              pump,
              'OFF',
              `Soil moisture high in ${zoneName}, stopping irrigation`,
              'soilMoisture',
              value,
              `${range.min}-${range.max}%`,
            );
          }
        }
      }

      // Temperature → fan / heater
      if (sensor.type === 'temperature' && zone.settings?.temperature) {
        const range = zone.settings.temperature;
        const value = sensor.value;

        const fan = zoneDevices.find((d) => d.type === 'fan');
        const heater = zoneDevices.find((d) => d.type === 'heater');

        if (typeof value === 'number') {
          if (value > range.max && fan) {
            await scheduleDeviceChange(
              fan,
              'ON',
              `Temperature high in ${zoneName}, turning fan ON`,
              'temperature',
              value,
              `${range.min}-${range.max}°C`,
            );
            if (heater) {
              await scheduleDeviceChange(
                heater,
                'OFF',
                `Temperature high in ${zoneName}, turning heater OFF`,
                'temperature',
                value,
                `${range.min}-${range.max}°C`,
              );
            }
          } else if (value < range.min && heater) {
            await scheduleDeviceChange(
              heater,
              'ON',
              `Temperature low in ${zoneName}, turning heater ON`,
              'temperature',
              value,
              `${range.min}-${range.max}°C`,
            );
            if (fan) {
              await scheduleDeviceChange(
                fan,
                'OFF',
                `Temperature low in ${zoneName}, turning fan OFF`,
                'temperature',
                value,
                `${range.min}-${range.max}°C`,
              );
            }
          }
        }
      }

      // Light → grow light
      if (sensor.type === 'light' && zone.settings?.light) {
        const range = zone.settings.light;
        const value = sensor.value;

        const lightDevice = zoneDevices.find((d) => d.type === 'light');

        if (typeof value === 'number' && lightDevice) {
          if (value < range.min) {
            await scheduleDeviceChange(
              lightDevice,
              'ON',
              `Light level low in ${zoneName}, turning grow lights ON`,
              'light',
              value,
              `${range.min}-${range.max} lux`,
            );
          } else if (value > range.max) {
            await scheduleDeviceChange(
              lightDevice,
              'OFF',
              `Light level high in ${zoneName}, turning grow lights OFF`,
              'light',
              value,
              `${range.min}-${range.max} lux`,
            );
          }
        }
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        events,
      },
    });
  } catch (error) {
    console.error('Automation tick error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error running automation tick',
      error: error.message,
    });
  }
};


