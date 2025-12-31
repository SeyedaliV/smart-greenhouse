import Plant from '../models/plantModel.js';
import Device from '../models/deviceModel.js';
import Sensor from '../models/sensorModel.js';
import Zone from '../models/zoneModel.js';
import { getDashboardAlerts } from '../services/alertService.js';

export const getDashboardData = async (req, res) => {
  try {
    const [plants, devices, sensors, zones] = await Promise.all([
      Plant.find().populate('zone'),
      Device.find().populate('zone'),
      Sensor.find().populate('zone'),
      Zone.find(),
    ]);

    // Aggregate averages for plant-specific sensors to ensure cards and dashboard reflect true means
    const plantSensorAgg = await Sensor.aggregate([
      { $match: { plant: { $ne: null } } },
      {
        $group: {
          _id: { plant: '$plant', type: '$type' },
          avgValue: { $avg: '$value' },
        },
      },
    ]);
    const plantAverages = new Map();
    plantSensorAgg.forEach((row) => {
      const plantId = row._id.plant.toString();
      const type = row._id.type;
      if (!plantAverages.has(plantId)) plantAverages.set(plantId, {});
      plantAverages.get(plantId)[type] = Math.round(row.avgValue * 10) / 10;
    });

    const plantViewModels = plants.map((plant) => ({
      id: plant._id,
      name: plant.name,
      type: plant.type,
      status: plant.status,
      currentStats: {
        ...plant.currentStats,
        ...(plantAverages.get(plant._id.toString()) || {}),
      },
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
      zone: device.zone,
    }));

    const sensorViewModels = sensors.map((sensor) => ({
      id: sensor._id,
      name: sensor.name,
      type: sensor.type,
      value: sensor.value,
      unit: sensor.unit,
      zone: sensor.zone,
      plant: sensor.plant,
      status: sensor.status,
      lastUpdate: sensor.lastUpdate,
      plantType: sensor.plantType,
    }));

    // Calculate average sensor values by type across the whole greenhouse (GENERAL sensors only)
    const aggregates = {};
    sensorViewModels.forEach((sensor) => {
      // Only general (non-plant) sensors contribute to greenhouse-wide environment cards
      if (sensor.plantType || sensor.plant) return;
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

    const { alerts } = await getDashboardAlerts();

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
        totalZones: zones.length,
        totalSensors: sensorViewModels.length,
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
