import express from 'express';
import Plant from '../models/plantModel.js';
import Device from '../models/deviceModel.js';

const router = express.Router();

router.post('/seed', async (_, res) => {
  try {
    await Plant.deleteMany({});
    await Device.deleteMany({});

    // Create plants with daysToMature
    const plants = await Plant.create([
      {
        name: "Tomato Plant",
        type: "tomato",
        currentStats: { 
          temperature: 26, 
          soilMoisture: 55, 
          light: 800,
          lastUpdated: new Date()
        },
        daysToMature: 70, // اضافه کردن این خط
        status: "optimal"
      },
      {
        name: "Cucumber Plant", 
        type: "cucumber",
        currentStats: { 
          temperature: 24, 
          soilMoisture: 65, 
          light: 750,
          lastUpdated: new Date()
        },
        daysToMature: 55, // اضافه کردن این خط
        status: "optimal"
      },
      {
        name: "Lettuce Plant",
        type: "lettuce", 
        currentStats: { 
          temperature: 20, 
          soilMoisture: 50, 
          light: 600,
          lastUpdated: new Date()
        },
        daysToMature: 45, // اضافه کردن این خط
        status: "needs_attention"
      },
      {
        name: "Bell Pepper Plant",
        type: "bellpepper",
        currentStats: { 
          temperature: 28, 
          soilMoisture: 40, 
          light: 900,
          lastUpdated: new Date()
        },
        daysToMature: 75, // اضافه کردن این خط
        status: "critical"
      }
    ]);

    // Create devices
    const devices = await Device.create([
      {
        name: "Water Pump",
        type: "waterPump",
        status: "ON",
        powerConsumption: 500,
        lastAction: new Date()
      },
      {
        name: "Ventilation Fans",
        type: "fan", 
        status: "AUTO",
        powerConsumption: 200,
        lastAction: new Date()
      },
      {
        name: "Grow Lights",
        type: "light",
        status: "OFF",
        powerConsumption: 800,
        lastAction: new Date()
      },
      {
        name: "Heater",
        type: "heater",
        status: "OFF",
        powerConsumption: 1500,
        lastAction: new Date()
      }
    ]);

    res.json({
      status: 'success',
      message: 'Created 4 plants and 4 devices',
      data: { plants: plants.length, devices: devices.length }
    });

  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating data',
      error: error.message
    });
  }
});

export default router;