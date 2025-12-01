import Plant from '../models/plantModel.js';
import Device from '../models/deviceModel.js';
import Sensor from '../models/sensorModel.js';
import Zone from '../models/zoneModel.js';

// Helper: generate smart alerts based on plant stats vs optimal conditions
const generatePlantHealthAlerts = (plants) => {
  const alerts = [];

  plants.forEach((plant) => {
    const {
      name,
      type,
      status,
      currentStats = {},
      optimalConditions = {},
      daysUntilHarvest,
    } = plant;

    if (!currentStats || !optimalConditions) return;

    const checks = [
      { key: 'temperature', label: 'Temperature', unit: '°C' },
      { key: 'humidity', label: 'Humidity', unit: '%' },
      { key: 'soilMoisture', label: 'Soil moisture', unit: '%' },
      { key: 'light', label: 'Light level', unit: 'lux' },
    ];

    checks.forEach(({ key, label, unit }) => {
      const value = currentStats[key];
      const optimal = optimalConditions[key];

      if (
        value === undefined ||
        !optimal ||
        optimal.min === undefined ||
        optimal.max === undefined
      ) {
        return;
      }

      if (value < optimal.min) {
        alerts.push({
          type: status === 'critical' ? 'critical' : 'warning',
          source: 'plant',
          metric: key,
          message: `${label} too low for ${name}`,
          action: `Increase ${label.toLowerCase()} towards ${optimal.min}-${optimal.max} ${unit}.`,
          value: `${value} ${unit}`,
          plantType: type,
        });
      } else if (value > optimal.max) {
        alerts.push({
          type: status === 'critical' ? 'critical' : 'warning',
          source: 'plant',
          metric: key,
          message: `${label} too high for ${name}`,
          action: `Reduce ${label.toLowerCase()} towards ${optimal.min}-${optimal.max} ${unit}.`,
          value: `${value} ${unit}`,
          plantType: type,
        });
      }
    });

    // High‑level alert based on plant status
    if (status === 'critical') {
      alerts.push({
        type: 'critical',
        source: 'plant',
        metric: 'status',
        message: `${name} is in critical condition`,
        action: 'Check sensors, irrigation, and lighting immediately.',
        plantType: type,
      });
    } else if (status === 'needs_attention') {
      alerts.push({
        type: 'warning',
        source: 'plant',
        metric: 'status',
        message: `${name} needs attention`,
        action: 'Review recent environmental changes and adjust gradually.',
        plantType: type,
      });
    }

    // Predictive harvest alerts
    if (typeof daysUntilHarvest === 'number') {
      if (daysUntilHarvest <= 0) {
        alerts.push({
          type: 'info',
          source: 'harvest',
          metric: 'harvest',
          message: `${name} is ready for harvest`,
          action: 'Schedule harvest as soon as possible to avoid quality loss.',
          value: 'Harvest now',
          plantType: type,
        });
      } else if (daysUntilHarvest <= 7) {
        alerts.push({
          type: 'info',
          source: 'harvest',
          metric: 'harvest',
          message: `${name} will be ready for harvest in ${daysUntilHarvest} days`,
          action: 'Prepare resources and plan harvest window.',
          value: `${daysUntilHarvest} days left`,
          plantType: type,
        });
      }
    }
  });

  return alerts;
};

// Helper: alerts from sensors and zones (environment, stale data, calibration)
const generateEnvironmentAlerts = (sensors, zones) => {
  const alerts = [];

  const zoneByName = new Map(zones.map((z) => [z.name, z]));
  const now = new Date();

  sensors.forEach((sensor) => {
    const {
      name,
      type,
      value,
      unit,
      zone: zoneName,
      status,
      lastUpdate,
      plantType,
    } = sensor;

    const zone = zoneByName.get(zoneName);

    // Inactive or failed sensors
    if (status === 'inactive') {
      alerts.push({
        type: 'warning',
        source: 'sensor',
        metric: type,
        message: `Sensor offline: ${name}`,
        action: 'Check wiring, power supply, or replace the sensor.',
        value: `${zoneName || 'Unknown zone'}`,
      });
      return;
    }

    // Stale data (no updates in the last 15 minutes)
    if (lastUpdate) {
      const diffMinutes = (now - new Date(lastUpdate)) / (1000 * 60);
      if (diffMinutes > 15) {
        alerts.push({
          type: 'warning',
          source: 'sensor',
          metric: type,
          message: `No recent data from ${name}`,
          action: 'Verify network connection and sensor health.',
          value: `${Math.round(diffMinutes)} min since last update`,
        });
      }
    }

    // Compare sensor value with zone optimal ranges
    if (zone && zone.settings && zone.settings[type]) {
      const setting = zone.settings[type];
      if (
        typeof value === 'number' &&
        setting.min !== undefined &&
        setting.max !== undefined
      ) {
        if (value < setting.min) {
          alerts.push({
            type: 'warning',
            source: 'environment',
            metric: type,
            message: `${type} too low in ${zoneName}`,
            action: `Increase ${type} towards ${setting.min}-${setting.max} ${unit}.`,
            value: `${value} ${unit}`,
          });
        } else if (value > setting.max) {
          alerts.push({
            type: 'warning',
            source: 'environment',
            metric: type,
            message: `${type} too high in ${zoneName}`,
            action: `Reduce ${type} towards ${setting.min}-${setting.max} ${unit}.`,
            value: `${value} ${unit}`,
          });
        }
      }
    }

    // Soil moisture sensor specific: per crop type
    if (type === 'soilMoisture' && plantType) {
      if (value < 30) {
        alerts.push({
          type: 'critical',
          source: 'sensor',
          metric: 'soilMoisture',
          message: `Severe drought risk for ${plantType} in ${zoneName}`,
          action: 'Start irrigation immediately and verify water supply.',
          value: `${value}%`,
        });
      } else if (value > 80) {
        alerts.push({
          type: 'warning',
          source: 'sensor',
          metric: 'soilMoisture',
          message: `Over‑irrigation risk for ${plantType} in ${zoneName}`,
          action: 'Reduce watering cycle to prevent root rot.',
          value: `${value}%`,
        });
      }
    }
  });

  return alerts;
};

// Helper: alerts from devices (failures, mode conflicts, energy)
const generateDeviceAlerts = (devices) => {
  const alerts = [];
  const now = new Date();

  devices.forEach((device) => {
    const { name, type, status, lastAction, powerConsumption, zone } = device;

    // Devices stuck ON for too long (e.g., > 4h)
    if (status === 'ON' && lastAction) {
      const hoursOn = (now - new Date(lastAction)) / (1000 * 60 * 60);
      if (hoursOn > 4) {
        alerts.push({
          type: 'warning',
          source: 'device',
          metric: 'runtime',
          message: `${name} has been running for ${hoursOn.toFixed(1)} hours`,
          action: 'Check if current runtime is intentional; consider switching to AUTO.',
          value: `${hoursOn.toFixed(1)} h`,
        });
      }
    }

    // High power consumption anomaly
    if (typeof powerConsumption === 'number' && powerConsumption > 250) {
      alerts.push({
        type: 'warning',
        source: 'device',
        metric: 'power',
        message: `High power usage detected on ${name}`,
        action: 'Inspect device for mechanical issues or inefficiency.',
        value: `${powerConsumption} W`,
      });
    }

    // Safety: heater ON but zone name suggests a cool crop zone (simple heuristic)
    if (type === 'heater' && status === 'ON' && zone && /Lettuce/i.test(zone)) {
      alerts.push({
        type: 'warning',
        source: 'device',
        metric: 'heater',
        message: `Heater running in a cool‑crop zone (${zone})`,
        action: 'Confirm temperature setpoints to avoid heat stress.',
      });
    }
  });

  return alerts;
};

export const getDashboardData = async (req, res) => {
  try {
    const [plants, devices, sensors, zones] = await Promise.all([
      Plant.find(),
      Device.find(),
      Sensor.find(),
      Zone.find(),
    ]);

    const plantViewModels = plants.map((plant) => ({
      id: plant._id,
      name: plant.name,
      type: plant.type,
      status: plant.status,
      currentStats: plant.currentStats || {},
      optimalConditions: plant.optimalConditions || {},
      plantingDate: plant.plantingDate,
      daysToMature: plant.daysToMature,
      estimatedHarvestDate: plant.estimatedHarvestDate,
      // استفاده از متد مدل برای محاسبه‌ی واقعی روزهای مانده تا برداشت
      daysUntilHarvest:
        typeof plant.getDaysUntilHarvest === 'function'
          ? plant.getDaysUntilHarvest()
          : 30,
    }));

    const deviceViewModels = devices.map((device) => ({
      id: device._id,
      name: device.name,
      type: device.type,
      status: device.status,
      lastAction: device.lastAction,
      powerConsumption: device.powerConsumption,
      zone: device.zone,
    }));

    const sensorViewModels = sensors.map((sensor) => ({
      id: sensor._id,
      name: sensor.name,
      type: sensor.type,
      value: sensor.value,
      unit: sensor.unit,
      zone: sensor.zone,
      status: sensor.status,
      lastUpdate: sensor.lastUpdate,
      plantType: sensor.plantType,
    }));

    // Calculate average sensor values by type across the whole greenhouse
    const aggregates = {};
    sensorViewModels.forEach((sensor) => {
      if (typeof sensor.value !== 'number') return;
      const key = sensor.type;
      if (!aggregates[key]) {
        aggregates[key] = { sum: 0, count: 0 };
      }
      aggregates[key].sum += sensor.value;
      aggregates[key].count += 1;
    });

    const avg = (key) =>
      aggregates[key] && aggregates[key].count > 0
        ? Math.round((aggregates[key].sum / aggregates[key].count) * 10) / 10
        : 0;

    const plantAlerts = generatePlantHealthAlerts(plantViewModels);
    const envAlerts = generateEnvironmentAlerts(sensorViewModels, zones);
    const deviceAlerts = generateDeviceAlerts(deviceViewModels);

    const alerts = [...plantAlerts, ...envAlerts, ...deviceAlerts];

    const dashboardData = {
      overview: {
        totalPlants: plantViewModels.length,
        activeDevices: deviceViewModels.filter((d) => d.status === 'ON').length,
        criticalPlants: plantViewModels.filter(
          (p) => p.status === 'critical',
        ).length,
        needsAttentionPlants: plantViewModels.filter(
          (p) => p.status === 'needs_attention',
        ).length,
        optimalPlants: plantViewModels.filter(
          (p) => p.status === 'optimal',
        ).length,
      },
      environment: {
        temperature: avg('temperature'),
        humidity: avg('humidity'),
        light: avg('light'),
        soilMoisture: avg('soilMoisture'),
      },
      plants: plantViewModels,
      devices: deviceViewModels,
      alerts,
    };

    res.status(200).json({
      status: 'success',
      data: dashboardData,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching dashboard',
      error: error.message,
    });
  }
};