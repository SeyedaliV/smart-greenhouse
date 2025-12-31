import Sensor from '../models/sensorModel.js';
import Device from '../models/deviceModel.js';
import Plant from '../models/plantModel.js';
import Zone from '../models/zoneModel.js';
import { createAuditLog } from '../controllers/auditLogController.js';
import { getDashboardAlerts } from '../services/alertService.js';

// Simple in‑memory state for simulation
const sensorTimers = new Map();
let batteryTimer = null;
let automationTimer = null;
let alertsTimer = null;
let ioRef = null;
let sensorsSyncTimer = null;

// Helper: clamp number
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Helper: generate base fluctuation around a target range
const computeDrift = (current, min, max) => {
  const center = (min + max) / 2;
  const span = max - min || 1;
  const smallStep = span * 0.02;
  const bigStep = span * 0.15;

  const outOfRangeChance = 0.1; // 10% chance of going out of range
  const r = Math.random();

  if (r < outOfRangeChance) {
    // Push noticeably outside range for alert testing
    if (current >= center) {
      return current + bigStep;
    }
    return current - bigStep;
  }

  // Small random walk around center
  const direction = Math.random() < 0.5 ? -1 : 1;
  return current + direction * smallStep;
};

// Compute influence of ON devices in a zone on a sensor reading
const applyDeviceInfluence = (sensor, devices, zoneSettings) => {
  const value = sensor.value;
  let delta = 0;

  devices
    .filter((d) => d.status === 'ON')
    .forEach((device) => {
      switch (device.type) {
        case 'heater':
          if (sensor.type === 'temperature') delta += 0.6;
          if (sensor.type === 'humidity') delta -= 0.2;
          break;
        case 'fan':
          if (sensor.type === 'temperature') delta -= 0.6;
          if (sensor.type === 'humidity') delta -= 0.3;
          break;
        case 'waterPump':
          if (sensor.type === 'soilMoisture') delta += 1.2;
          if (sensor.type === 'humidity') delta += 0.2;
          break;
        case 'light':
          if (sensor.type === 'light') delta += 40;
          if (sensor.type === 'temperature') delta += 0.2;
          break;
        default:
          break;
      }
    });

  // Softly pull back toward zone optimal when devices are OFF
  const setting = zoneSettings?.[sensor.type];
  if (setting && devices.every((d) => d.status !== 'ON')) {
    const target = setting.optimal ?? (setting.min + setting.max) / 2;
    delta += (target - value) * 0.02;
  }

  return value + delta;
};

// Update a single sensor reading according to its interval and devices
const tickSensor = async (sensorId) => {
  const sensor = await Sensor.findById(sensorId).populate('zone').populate('plant');
  if (!sensor) return;

  if (sensor.status !== 'active' || sensor.connectionStatus === 'disconnected' || sensor.batteryLevel <= 0) {
    return;
  }

  const zone = sensor.zone ? await Zone.findById(sensor.zone._id || sensor.zone) : null;
  const devices = zone ? await Device.find({ zone: zone._id }) : [];

  // Determine min/max from plant or zone settings
  let min = 0;
  let max = 100;

  if (sensor.plant && sensor.plant.optimalConditions) {
    const oc = sensor.plant.optimalConditions;
    const key = sensor.type;
    if (oc[key]?.min !== undefined && oc[key]?.max !== undefined) {
      min = oc[key].min;
      max = oc[key].max;
    }
  } else if (zone && zone.settings) {
    const zs = zone.settings;
    const key = sensor.type;
    if (zs[key]?.min !== undefined && zs[key]?.max !== undefined) {
      min = zs[key].min;
      max = zs[key].max;
    }
  }

  let nextValue = computeDrift(sensor.value, min, max);
  nextValue = applyDeviceInfluence(
    { ...sensor.toObject(), value: nextValue },
    devices,
    zone?.settings || null,
  );

  // Clamp to a reasonable physical range per type
  const typeLimits = {
    temperature: { min: 5, max: 45 },
    humidity: { min: 10, max: 100 },
    soilMoisture: { min: 0, max: 100 },
    light: { min: 0, max: 2000 },
  };

  const limits = typeLimits[sensor.type] || { min: -1000, max: 1000 };

  sensor.value = Math.round(clamp(nextValue, limits.min, limits.max) * 10) / 10;
  sensor.lastUpdate = new Date();
  sensor.lastCommunication = new Date();

  await sensor.save();

  if (ioRef) {
    ioRef.emit('sensor:update', {
      id: sensor._id.toString(),
      zoneId: sensor.zone?._id?.toString() || sensor.zone?.toString() || null,
      plantId: sensor.plant?._id?.toString() || sensor.plant?.toString() || null,
      type: sensor.type,
      value: sensor.value,
      unit: sensor.unit,
      batteryLevel: sensor.batteryLevel,
      status: sensor.status,
      connectionStatus: sensor.connectionStatus,
      lastUpdate: sensor.lastUpdate,
    });
  }
};

// Periodically drain battery for all sensors
const startBatteryDrain = () => {
  if (batteryTimer) return;
  batteryTimer = setInterval(async () => {
    const sensors = await Sensor.find({ batteryLevel: { $gt: 0 } });

    for (const sensor of sensors) {
      const prevLevel = sensor.batteryLevel;
      sensor.batteryLevel = Math.max(0, sensor.batteryLevel - 1);

      if (sensor.batteryLevel === 0 && sensor.status !== 'inactive') {
        sensor.status = 'inactive';
        sensor.connectionStatus = 'disconnected';
        await sensor.save();

        if (ioRef) {
          ioRef.emit('sensor:batteryEmpty', {
            id: sensor._id.toString(),
            name: sensor.name,
            zoneId: sensor.zone?.toString() || null,
          });
        }
      } else if (sensor.batteryLevel !== prevLevel) {
        await sensor.save();
      }
    }
  }, 60000);
};

// Mirror automationController.runAutomationTick, but as background job
const runAutomationLoop = () => {
  if (automationTimer) return;

  automationTimer = setInterval(async () => {
    try {
      const [devices, sensors, zones] = await Promise.all([
        Device.find().populate('zone'),
        Sensor.find().populate('zone'),
        Zone.find(),
      ]);

      const zoneById = new Map(zones.map((z) => [z._id.toString(), z]));
      const devicesByZone = new Map();

      devices.forEach((d) => {
        const key = d.zone ? d.zone._id?.toString() || d.zone.toString() : 'GLOBAL';
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
        if (!device || device.status === newStatus || device.status !== 'AUTO') return null;

        const updated = await Device.findByIdAndUpdate(
          device._id,
          { status: newStatus, lastAction: new Date() },
          { new: true, runValidators: true },
        );

        // For automation we have no req, so we create a fake req-like object
        await createAuditLog({
          req: { user: null, headers: {}, socket: {} },
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
        if (ioRef) {
          ioRef.emit('device:update', {
            id: updated._id.toString(),
            status: updated.status,
            zoneId: updated.zone?.toString() || null,
          });
          ioRef.emit('automation:event', event);
        }
        return updated;
      };

      for (const sensor of sensors) {
        const zoneId = sensor.zone?._id?.toString() || sensor.zone?.toString();
        if (!zoneId) continue;

        const zone = zoneById.get(zoneId);
        if (!zone) continue;

        const zoneDevices = devicesByZone.get(zoneId) || [];

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
                `Soil moisture low in ${zone.name}, starting irrigation`,
                'soilMoisture',
                value,
                `${range.min}-${range.max}%`,
              );
            } else if (value > range.max) {
              await scheduleDeviceChange(
                pump,
                'OFF',
                `Soil moisture high in ${zone.name}, stopping irrigation`,
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
                `Temperature high in ${zone.name}, turning fan ON`,
                'temperature',
                value,
                `${range.min}-${range.max}°C`,
              );
              if (heater) {
                await scheduleDeviceChange(
                  heater,
                  'OFF',
                  `Temperature high in ${zone.name}, turning heater OFF`,
                  'temperature',
                  value,
                  `${range.min}-${range.max}°C`,
                );
              }
            } else if (value < range.min && heater) {
              await scheduleDeviceChange(
                heater,
                'ON',
                `Temperature low in ${zone.name}, turning heater ON`,
                'temperature',
                value,
                `${range.min}-${range.max}°C`,
              );
              if (fan) {
                await scheduleDeviceChange(
                  fan,
                  'OFF',
                  `Temperature low in ${zone.name}, turning fan OFF`,
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
                `Light level low in ${zone.name}, turning grow lights ON`,
                'light',
                value,
                `${range.min}-${range.max} lux`,
              );
            } else if (value > range.max) {
              await scheduleDeviceChange(
                lightDevice,
                'OFF',
                `Light level high in ${zone.name}, turning grow lights OFF`,
                'light',
                value,
                `${range.min}-${range.max} lux`,
              );
            }
          }
        }
      }
    } catch (err) {
      console.error('Automation loop error:', err);
    }
  }, 8000);
};

// Periodically recompute alerts + plant statuses and push over socket
let lastAlertsSnapshot = [];

const startAlertsLoop = () => {
  if (alertsTimer) return;

  alertsTimer = setInterval(async () => {
    try {
      // Reuse the same logic as dashboard controller
      const { alerts } = await getDashboardAlerts();

      if (ioRef) {
        ioRef.emit('alerts:update', alerts);
      }

      // Diff alerts to detect resolved ones
      const keyOf = (a) => `${a.source || ''}|${a.metric || ''}|${a.message || ''}|${a.plantType || ''}`;
      const prevKeys = new Set(lastAlertsSnapshot.map(keyOf));
      const newKeys = new Set(alerts.map(keyOf));

      // New alerts
      alerts.forEach((a) => {
        const k = keyOf(a);
        if (!prevKeys.has(k) && ioRef) {
          ioRef.emit('alerts:new', a);
        }
      });

      // Resolved alerts
      lastAlertsSnapshot.forEach((a) => {
        const k = keyOf(a);
        if (!newKeys.has(k) && ioRef) {
          ioRef.emit('alerts:resolved', a);
        }
      });

      lastAlertsSnapshot = alerts;
    } catch (err) {
      console.error('Alerts loop error:', err);
    }
  }, 7000);
};

// Periodically recompute plant currentStats from sensors and set plant.status
const startPlantStatusLoop = () => {
  setInterval(async () => {
    try {
      const sensorAgg = await Sensor.aggregate([
        {
          $match: {
            plant: { $ne: null },
          },
        },
        {
          $group: {
            _id: { plant: '$plant', type: '$type' },
            avgValue: { $avg: '$value' },
          },
        },
      ]);

      const byPlant = new Map();
      sensorAgg.forEach((entry) => {
        const plantId = entry._id.plant.toString();
        const type = entry._id.type;
        if (!byPlant.has(plantId)) byPlant.set(plantId, {});
        byPlant.get(plantId)[type] = Math.round(entry.avgValue * 10) / 10;
      });

      const plants = await Plant.find();

      for (const plant of plants) {
        const stats = byPlant.get(plant._id.toString()) || {};
        const currentStats = {
          ...(plant.currentStats || {}),
          temperature: stats.temperature ?? plant.currentStats?.temperature,
          humidity: stats.humidity ?? plant.currentStats?.humidity,
          soilMoisture: stats.soilMoisture ?? plant.currentStats?.soilMoisture,
          light: stats.light ?? plant.currentStats?.light,
          lastUpdated: new Date(),
        };

        // Decide status based on deviation from optimalConditions
        let worst = 'optimal';

        const checkMetric = (key) => {
          const value = currentStats[key];
          const range = plant.optimalConditions?.[key];
          if (typeof value !== 'number' || !range || range.min === undefined || range.max === undefined) {
            return;
          }
          if (value < range.min || value > range.max) {
            const span = range.max - range.min || 1;
            const dist = Math.min(Math.abs(value - range.min), Math.abs(value - range.max));
            const severityRatio = dist / span;
            if (severityRatio > 0.3) {
              worst = 'critical';
            } else if (worst !== 'critical') {
              worst = 'needs_attention';
            }
          }
        };

        ['temperature', 'humidity', 'soilMoisture', 'light'].forEach(checkMetric);

        plant.currentStats = currentStats;
        plant.status = worst;
        await plant.save();
      }
    } catch (err) {
      console.error('Plant status loop error:', err);
    }
  }, 10000);
};

// Initialize or refresh per-sensor timers according to samplingIntervalSeconds
const syncSensorTimers = async () => {
  const sensors = await Sensor.find();

  const existingIds = new Set(sensors.map((s) => s._id.toString()));

  // Clear timers for sensors that were deleted
  sensorTimers.forEach((timerId, id) => {
    if (!existingIds.has(id)) {
      clearInterval(timerId);
      sensorTimers.delete(id);
    }
  });

  // Create timers for new sensors
  sensors.forEach((sensor) => {
    const id = sensor._id.toString();
    if (sensorTimers.has(id)) return;

    const intervalMs = Math.max(5000, (sensor.samplingIntervalSeconds || 60) * 1000);
    const timerId = setInterval(() => {
      tickSensor(id).catch((err) => console.error('Sensor tick error:', err));
    }, intervalMs);

    sensorTimers.set(id, timerId);
  });
};

export const startSimulationEngine = async (io) => {
  ioRef = io;

  await syncSensorTimers();
  // Periodically resync timers to include newly created or deleted sensors
  sensorsSyncTimer = setInterval(() => {
    syncSensorTimers().catch((err) => console.error('Sensor sync error:', err));
  }, 30000);
  startBatteryDrain();
  runAutomationLoop();
  startAlertsLoop();
  startPlantStatusLoop();

  console.log('🌿 Simulation engine started');
};

export const stopSimulationEngine = () => {
  sensorTimers.forEach((timerId) => clearInterval(timerId));
  sensorTimers.clear();

  if (batteryTimer) clearInterval(batteryTimer);
  if (automationTimer) clearInterval(automationTimer);
  if (alertsTimer) clearInterval(alertsTimer);

  ioRef = null;
};


