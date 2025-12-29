import Plant from '../models/plantModel.js';
import Device from '../models/deviceModel.js';
import Sensor from '../models/sensorModel.js';
import Zone from '../models/zoneModel.js';

// Extracted from dashboardController so it can be reused by the simulation engine
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

const generateEnvironmentAlerts = (sensors, zones) => {
  const alerts = [];

  const zoneById = new Map(zones.map((z) => [z._id.toString(), z]));
  const now = new Date();

  sensors.forEach((sensor) => {
    const {
      name,
      type,
      value,
      unit,
      zone,
      status,
      lastUpdate,
      plantType,
    } = sensor;

    const zoneObj = zone ? zoneById.get(zone._id?.toString() || zone.toString()) : null;
    const zoneName = zoneObj?.name || 'Unknown zone';

    if (status === 'inactive') {
      alerts.push({
        type: 'warning',
        source: 'sensor',
        metric: type,
        message: `Sensor offline: ${name}`,
        action: 'Check wiring, power supply, or replace the sensor.',
        value: `${zoneName}`,
      });
      return;
    }

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

    if (zoneObj && zoneObj.settings && zoneObj.settings[type]) {
      const setting = zoneObj.settings[type];
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

const generateDeviceAlerts = (devices) => {
  const alerts = [];
  const now = new Date();

  devices.forEach((device) => {
    const { name, type, status, lastAction, powerConsumption, zone } = device;

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

export const getDashboardAlerts = async () => {
  const [plants, devices, sensors, zones] = await Promise.all([
    Plant.find().populate('zone'),
    Device.find().populate('zone'),
    Sensor.find().populate('zone'),
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
    zone: device.zone?.name || device.zone,
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

  const plantAlerts = generatePlantHealthAlerts(plantViewModels);
  const envAlerts = generateEnvironmentAlerts(sensorViewModels, zones);
  const deviceAlerts = generateDeviceAlerts(deviceViewModels);

  return {
    alerts: [...plantAlerts, ...envAlerts, ...deviceAlerts],
    plantViewModels,
    deviceViewModels,
    sensorViewModels,
    zones,
  };
};


