import Plant from '../models/plantModel.js';
import Device from '../models/deviceModel.js';

export const getDashboardData = async (req, res) => {
  try {
    const plants = await Plant.find();
    const devices = await Device.find();
    
    const dashboardData = {
      overview: {
        totalPlants: plants.length,
        activeDevices: devices.filter(d => d.status === 'ON').length,
        criticalPlants: plants.filter(p => p.status === 'critical').length,
        needsAttentionPlants: plants.filter(p => p.status === 'needs_attention').length,
        optimalPlants: plants.filter(p => p.status === 'optimal').length
      },
      environment: {
        temperature: 25,
        humidity: 65,
        light: 750
      },
      plants: plants.map(plant => ({
        id: plant._id,
        name: plant.name,
        type: plant.type,
        status: plant.status,
        currentStats: plant.currentStats || {},
        optimalConditions: plant.optimalConditions || {},
        plantingDate: plant.plantingDate,
        daysToMature: plant.daysToMature,
        estimatedHarvestDate: plant.estimatedHarvestDate,
        daysUntilHarvest: plant.daysUntilHarvest || 30
      })),
      devices: devices.map(device => ({
        id: device._id,
        name: device.name,
        type: device.type,
        status: device.status,
        lastAction: device.lastAction,
        powerConsumption: device.powerConsumption
      }))
    };

    res.status(200).json({
      status: 'success',
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching dashboard',
      error: error.message
    });
  }
};