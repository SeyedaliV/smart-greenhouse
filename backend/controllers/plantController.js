// backend/controllers/plantController.js
import Plant from '../models/plantModel.js';
import Sensor from '../models/sensorModel.js'; // اضافه کن اگر نداری
import { createAuditLog } from './auditLogController.js';

// GET /api/plants - همه گیاهان
export const getAllPlants = async (req, res) => {
  try {
    const plants = await Plant.find().populate('zone');

    // 📊 محاسبه‌ی میانگین سنسورهای هر گیاه (بر اساس سنسورهای اختصاص داده شده به آن گیاه)
    const sensorAverages = await Sensor.aggregate([
      {
        $match: {
          plant: { $ne: null }
        }
      },
      {
        $group: {
          _id: { plant: '$plant', type: '$type' },
          avgValue: { $avg: '$value' }
        }
      }
    ]);

    const averagesByPlant = new Map();
    sensorAverages.forEach((entry) => {
      const plantId = entry._id.plant.toString();
      const type = entry._id.type;
      if (!averagesByPlant.has(plantId)) {
        averagesByPlant.set(plantId, {});
      }
      averagesByPlant.get(plantId)[type] = Math.round(entry.avgValue * 10) / 10;
    });

    const plantsWithStats = plants.map((plant) => {
      const plantId = plant._id.toString();
      const avgStats = averagesByPlant.get(plantId) || {};

      const currentStats = {
        ...(plant.currentStats || {}),
        temperature: avgStats.temperature ?? plant.currentStats?.temperature,
        humidity: avgStats.humidity ?? plant.currentStats?.humidity,
        soilMoisture: avgStats.soilMoisture ?? plant.currentStats?.soilMoisture,
        light: avgStats.light ?? plant.currentStats?.light,
        lastUpdated: new Date()
      };

      return {
        ...plant.toObject(),
        currentStats
      };
    });

    res.status(200).json({
      status: 'success',
      results: plantsWithStats.length,
      data: { plants: plantsWithStats }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching plants',
      error: error.message
    });
  }
};

// GET /api/plants/:id - جزئیات یک گیاه + سنسورهای متصل به آن
export const getPlant = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id).populate('zone');

    if (!plant) {
      return res.status(404).json({
        status: 'error',
        message: 'Plant not found'
      });
    }

    // تنظیمات بهینه برای گیاهان قدیمی (اگر optimalConditions وجود نداشت)
    const defaultConditions = {
      tomato: { 
        temperature: { min: 22, max: 28, optimal: 25 },
        humidity: { min: 50, max: 70, optimal: 60 },
        soilMoisture: { min: 40, max: 60, optimal: 50 },
        light: { min: 600, max: 1000, optimal: 800 },
        daysToMature: 70
      },
      cucumber: { 
        temperature: { min: 20, max: 30, optimal: 25 },
        humidity: { min: 60, max: 80, optimal: 70 },
        soilMoisture: { min: 50, max: 70, optimal: 60 },
        light: { min: 500, max: 900, optimal: 700 },
        daysToMature: 55
      },
      lettuce: { 
        temperature: { min: 15, max: 25, optimal: 20 },
        humidity: { min: 55, max: 75, optimal: 65 },
        soilMoisture: { min: 45, max: 65, optimal: 55 },
        light: { min: 400, max: 800, optimal: 600 },
        daysToMature: 45
      },
      bellpepper: { 
        temperature: { min: 22, max: 32, optimal: 27 },
        humidity: { min: 50, max: 70, optimal: 60 },
        soilMoisture: { min: 40, max: 60, optimal: 50 },
        light: { min: 700, max: 1100, optimal: 900 },
        daysToMature: 75
      },
      default: {
        temperature: { min: 18, max: 30, optimal: 24 },
        humidity: { min: 50, max: 80, optimal: 65 },
        soilMoisture: { min: 40, max: 70, optimal: 55 },
        light: { min: 500, max: 1000, optimal: 750 },
        daysToMature: 60
      }
    };

    const conditions = defaultConditions[plant.type] || defaultConditions.default;

    if (!plant.optimalConditions) {
      plant.optimalConditions = {
        temperature: conditions.temperature,
        humidity: conditions.humidity,
        soilMoisture: conditions.soilMoisture,
        light: conditions.light
      };
      plant.daysToMature = conditions.daysToMature;
      await plant.save(); // اختیاری: ذخیره کن تا دفعه بعد نیازی نباشه
    }

    // 🔥 سنسورهای متصل به این گیاه رو بگیر (با اطلاعات کامل برای UI)
    const sensors = await Sensor.find({ plant: plant._id })
      .populate('zone', 'name')
      .populate('plant', 'name type')
      .sort({ type: 1 });

    res.status(200).json({
      status: 'success',
      data: {
        plant,
        sensors // اینو اضافه کردیم – دقیقاً چیزی که فرانت‌اند نیاز داره!
      }
    });
  } catch (error) {
    console.error('Error fetching plant:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error fetching plant details'
    });
  }
};

// POST /api/plants - ایجاد گیاه جدید
export const createPlant = async (req, res) => {
  try {
    const plant = await Plant.create(req.body);

    await createAuditLog({
      req,
      actionType: 'PLANT_CREATE',
      entityType: 'Plant',
      entityId: plant._id.toString(),
      entityName: plant.name,
      description: 'Created new plant',
      meta: { type: plant.type, zone: plant.zone }
    });

    res.status(201).json({
      status: 'success',
      data: { plant }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// PATCH /api/plants/:id - آپدیت گیاه
export const updatePlant = async (req, res) => {
  try {
    const plant = await Plant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

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
      meta: { type: plant.type, zone: plant.zone }
    });

    res.status(200).json({
      status: 'success',
      data: { plant }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// DELETE /api/plants/:id - حذف گیاه
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
      meta: { type: plant.type, zone: plant.zone }
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