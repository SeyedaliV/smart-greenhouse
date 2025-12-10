import express from 'express';
import Plant from '../models/plantModel.js';
import Device from '../models/deviceModel.js';
import Zone from '../models/zoneModel.js';
import Sensor from '../models/sensorModel.js';
import AuditLog from '../models/auditLogModel.js';
import User from '../models/userModel.js';

const router = express.Router();

// Helper to get random int inclusive
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

router.post('/seed', async (req, res) => {
  try {
    // Wipe collections
    await AuditLog.deleteMany({});
    await Plant.deleteMany({});
    await Device.deleteMany({});
    await Sensor.deleteMany({});
    await Zone.deleteMany({});
    await User.deleteMany({});

    // Create zones
    const zonesData = [
      {
        name: 'Zone A',
        description: 'Tomato greenhouse bay',
        status: 'active',
        settings: {
          temperature: { min: 22, max: 28, optimal: 25 },
          humidity: { min: 50, max: 70, optimal: 60 },
          soilMoisture: { min: 40, max: 60, optimal: 50 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      {
        name: 'Zone B',
        description: 'Cucumber greenhouse bay',
        status: 'active',
        settings: {
          temperature: { min: 20, max: 30, optimal: 25 },
          humidity: { min: 60, max: 80, optimal: 70 },
          soilMoisture: { min: 50, max: 70, optimal: 60 },
          light: { min: 500, max: 900, optimal: 700 }
        }
      },
      {
        name: 'Zone C',
        description: 'Lettuce greenhouse bay',
        status: 'maintenance',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 55, max: 75, optimal: 65 },
          soilMoisture: { min: 45, max: 65, optimal: 55 },
          light: { min: 400, max: 800, optimal: 600 }
        }
      },
      {
        name: 'Zone D',
        description: 'Bell Pepper greenhouse bay',
        status: 'active',
        settings: {
          temperature: { min: 22, max: 32, optimal: 27 },
          humidity: { min: 50, max: 70, optimal: 60 },
          soilMoisture: { min: 40, max: 60, optimal: 50 },
          light: { min: 700, max: 1100, optimal: 900 }
        }
      }
    ];

    const zones = await Zone.create(zonesData);

    // Create a default admin user
    const admin = await User.create({ username: 'admin', password: 'admin123', role: 'admin' });

    const allPlants = [];
    const allSensors = [];
    const allDevices = [];

    // For each zone create realistic plants, sensors, and devices
    for (const zone of zones) {
      // Define plant type and varieties per zone
      const plantsByZone = {
        'Zone A': {
          type: 'tomato',
          varieties: [
            { name: 'Beef tomato', variety: 'Cherry Tomato' },
            { name: 'Roma tomato', variety: 'Roma Plum' },
            { name: 'Sweet tomato', variety: 'Amalia F1' },
            { name: 'Campari tomato', variety: 'Campari' }
          ]
        },
        'Zone B': {
          type: 'cucumber',
          varieties: [
            { name: 'Persian cucumber', variety: 'Beit Alpha' },
            { name: 'English cucumber', variety: 'Telegraph' },
            { name: 'Mini cucumber', variety: 'Mideast' },
            { name: 'Armenian cucumber', variety: 'Suyo Long' }
          ]
        },
        'Zone C': {
          type: 'lettuce',
          varieties: [
            { name: 'Iceberg Lettuce', variety: 'Iceberg' },
            { name: 'Romaine Lettuce', variety: 'Cos Romaine' },
            { name: 'Butterhead Lettuce', variety: 'Boston' },
            { name: 'Leaf Lettuce', variety: 'Oak Leaf' }
          ]
        },
        'Zone D': {
          type: 'bellpepper',
          varieties: [
            { name: 'Red Bell pepper', variety: 'Red Beauty' },
            { name: 'Yellow Bell pepper', variety: 'Gold Star' },
            { name: 'Orange Bell pepper', variety: 'Orange Wonder' },
            { name: 'Green Bell pepper', variety: 'Yolo' }
          ]
        }
      };

      const plantConfig = plantsByZone[zone.name];
      const mainType = plantConfig.type;
      const varieties = plantConfig.varieties;

      const daysToMatureByType = { tomato: 70, cucumber: 55, lettuce: 45, bellpepper: 75 };

      // create 3-4 varieties of the same plant type
      for (let i = 0; i < varieties.length; i++) {
        const variety = varieties[i];
        const plantingOffset = randInt(1, 30); // days ago
        const plantingDate = new Date();
        plantingDate.setDate(plantingDate.getDate() - plantingOffset);

        const currentStats = {
          temperature: randInt(18, 28),
          humidity: randInt(45, 75),
          soilMoisture: randInt(40, 70),
          light: randInt(450, 950),
          lastUpdated: new Date()
        };

        const plant = await Plant.create({
          name: variety.name,
          type: mainType,
          zone: zone._id,
          currentStats,
          plantingDate,
          daysToMature: daysToMatureByType[mainType] || 70,
          status: 'optimal'
        });

        allPlants.push(plant);
        // push plant id to zone.plants array
        zone.plants = zone.plants || [];
        zone.plants.push(plant._id);
      }

      // sensors: ensure 4 types, soilMoisture may have 1-2 sensors
      const sensorTypes = ['temperature', 'humidity', 'soilMoisture', 'light'];
      for (const sType of sensorTypes) {
        const count = sType === 'soilMoisture' ? randInt(1, 2) : 1;
        for (let i = 0; i < count; i++) {
          const valueByType = {
            temperature: randInt(16, 30),
            humidity: randInt(40, 80),
            soilMoisture: randInt(30, 80),
            light: randInt(300, 1100)
          };

          const unitByType = {
            temperature: '°C',
            humidity: '%',
            soilMoisture: '%',
            light: 'lux'
          };

          const sensor = await Sensor.create({
            name: `${sType.charAt(0).toUpperCase() + sType.slice(1)} Sensor ${zone.name}` + (count > 1 ? ` #${i+1}` : ''),
            type: sType,
            value: valueByType[sType],
            unit: unitByType[sType],
            zone: zone._id,
            lastUpdate: new Date(),
            status: 'active',
            plantType: sType === 'soilMoisture' ? (zone.plants && zone.plants.length ? allPlants.find(p => p.zone.toString() === zone._id.toString())?.type || 'tomato' : 'tomato') : undefined
          });

          allSensors.push(sensor);
        }
      }

      // devices: one of each type per zone
      const deviceTemplates = [
        { name: 'Water Pump', type: 'waterPump', power: 500 },
        { name: 'Ventilation Fans', type: 'fan', power: 200 },
        { name: 'Grow Lights', type: 'light', power: 800 },
        { name: 'Heater', type: 'heater', power: 1500 }
      ];

      for (const tpl of deviceTemplates) {
        const statusOptions = tpl.type === 'light' ? ['OFF', 'ON'] : ['OFF', 'ON', 'AUTO'];
        const device = await Device.create({
          name: `${tpl.name} ${zone.name}`,
          type: tpl.type,
          status: statusOptions[randInt(0, statusOptions.length - 1)],
          zone: zone._id,
          powerConsumption: tpl.power,
          lastAction: new Date()
        });

        allDevices.push(device);
      }

      // save updated zone plants array
      await zone.save();
    }

    // Create an audit log for seed run
    // Backfill any existing plants that might be missing optimalConditions
    const backfillConditions = {
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

    const plantsToFix = await Plant.find({ $or: [ { optimalConditions: { $exists: false } }, { 'optimalConditions.temperature': { $exists: false } } ] });
    for (const p of plantsToFix) {
      const c = backfillConditions[p.type] || backfillConditions.tomato;
      p.optimalConditions = c;
      p.daysToMature = p.daysToMature || c.daysToMature;
      // recalc estimatedHarvestDate when plantingDate and daysToMature present
      if (p.plantingDate && p.daysToMature) {
        const harvest = new Date(p.plantingDate);
        harvest.setDate(harvest.getDate() + p.daysToMature);
        p.estimatedHarvestDate = harvest;
      }
      await p.save();
    }

    await AuditLog.create({
      actionType: 'SEED_RUN',
      entityType: 'System',
      description: 'Database reseeded with realistic sample data',
      meta: { zones: zones.length, plants: allPlants.length, sensors: allSensors.length, devices: allDevices.length },
      username: admin.username
    });

    res.json({
      status: 'success',
      message: 'Database reseeded',
      data: {
        zones: zones.length,
        plants: allPlants.length,
        sensors: allSensors.length,
        devices: allDevices.length,
        adminUser: admin.username
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ status: 'error', message: 'Error creating data', error: error.message });
  }
});

export default router;