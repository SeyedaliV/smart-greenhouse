import Plant from '../models/plantModel.js';
import { createAuditLog } from './auditLogController.js';

export const getAllPlants = async (req, res) => {
  try {
    const plants = await Plant.find().populate('zone');

    res.status(200).json({
      status: 'success',
      results: plants.length,
      data: {
        plants
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching plants',
      error: error.message
    });
  }
};

// export const getPlant = async (req, res) => {
//   try {
//     const plant = await Plant.findOne({ type: req.params.type });

//     if (!plant) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Plant not found'
//       });
//     }

//     res.status(200).json({
//       status: 'success',
//       data: {
//         plant
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: 'error',
//       message: 'Error fetching plant',
//       error: error.message
//     });
//   }
// };

export const getPlant = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id).populate('zone');
    
    if (!plant) {
      return res.status(404).json({
        status: 'error',
        message: 'Plant not found'
      });
    }
    // ensure optimalConditions exist for older records
    if (!plant.optimalConditions || !plant.optimalConditions.temperature) {
      const conditions = {
        tomato: { 
          temperature: { min: 22, max: 28 }, 
          humidity: { min: 50, max: 70 }, 
          soilMoisture: { min: 40, max: 60 }, 
          light: { min: 600, max: 1000 },
          daysToMature: 70
        },
        cucumber: { 
          temperature: { min: 20, max: 30 }, 
          humidity: { min: 60, max: 80 }, 
          soilMoisture: { min: 50, max: 70 }, 
          light: { min: 500, max: 900 },
          daysToMature: 55
        },
        lettuce: { 
          temperature: { min: 15, max: 25 }, 
          humidity: { min: 55, max: 75 }, 
          soilMoisture: { min: 45, max: 65 }, 
          light: { min: 400, max: 800 },
          daysToMature: 45
        },
        bellpepper: { 
          temperature: { min: 22, max: 32 }, 
          humidity: { min: 50, max: 70 }, 
          soilMoisture: { min: 40, max: 60 }, 
          light: { min: 700, max: 1100 },
          daysToMature: 75
        }
      };

      plant.optimalConditions = conditions[plant.type] || conditions.tomato;
      plant.daysToMature = plant.daysToMature || (conditions[plant.type] && conditions[plant.type].daysToMature);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        plant: plant
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updatePlantStats = async (req, res) => {
  try {
    const { temperature, humidity, soilMoisture, light } = req.body;
    
    const plant = await Plant.findOneAndUpdate(
      { type: req.params.type },
      {
        $set: {
          'currentStats.temperature': temperature,
          'currentStats.humidity': humidity,
          'currentStats.soilMoisture': soilMoisture,
          'currentStats.light': light,
          'currentStats.lastUpdated': new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!plant) {
      return res.status(404).json({
        status: 'error',
        message: 'Plant not found'
      });
    }

    await createAuditLog({
      req,
      actionType: 'PLANT_UPDATE',
      entityType: 'Plant',
      entityId: plant._id.toString(),
      entityName: plant.name,
      description: 'Updated plant current statistics',
      meta: {
        type: plant.type,
        temperature,
        humidity,
        soilMoisture,
        light,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        plant
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating plant stats',
      error: error.message
    });
  }
};

export const createPlant = async (req, res) => {
  try {
    const plant = new Plant(req.body);
    await plant.save();

    await createAuditLog({
      req,
      actionType: 'PLANT_CREATE',
      entityType: 'Plant',
      entityId: plant._id.toString(),
      entityName: plant.name,
      description: 'Created new plant',
      meta: {
        type: plant.type,
        zone: plant.zone,
      },
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        plant: plant
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updatePlant = async (req, res) => {
  try {
    const plant = await Plant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!plant) {
      return res.status(404).json({
        status: 'error',
        message: 'Plant not found'
      });
    }
    
    await createAuditLog({
      req,
      actionType: 'PLANT_UPDATE',
      entityType: 'Plant',
      entityId: plant._id.toString(),
      entityName: plant.name,
      description: 'Updated plant details',
      meta: {
        type: plant.type,
        zone: plant.zone,
      },
    });

    res.json({
      status: 'success',
      data: {
        plant: plant
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const deletePlant = async (req, res) => {
  try {
    const plant = await Plant.findByIdAndDelete(req.params.id);
    
    if (!plant) {
      return res.status(404).json({
        status: 'error',
        message: 'Plant not found'
      });
    }
    
    await createAuditLog({
      req,
      actionType: 'PLANT_DELETE',
      entityType: 'Plant',
      entityId: plant._id.toString(),
      entityName: plant.name,
      description: 'Deleted plant',
      meta: {
        type: plant.type,
        zone: plant.zone,
      },
    });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};