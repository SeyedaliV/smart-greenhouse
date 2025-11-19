import Zone from '../models/zoneModel.js';
import Plant from '../models/plantModel.js';
// import Device from '../models/deviceModel.js';
// import Sensor from '../models/sensorModel.js';

// دریافت همه زون‌ها
export const getZones = async (req, res) => {
  try {
    const zones = await Zone.find();
    res.json(zones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ایجاد زون جدید
export const createZone = async (req, res) => {
  try {
    const zone = new Zone(req.body);
    await zone.save();
    res.status(201).json(zone);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// دریافت اطلاعات کامل یک زون
export const getZoneById = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id);
    
    if (!zone) {
      return res.status(404).json({ message: 'Zone not found' });
    }
    
    // گیاهان این زون رو جداگانه بگیر
    const plants = await Plant.find({ zone: req.params.id })
      .select('name type status currentStats plantingDate estimatedHarvestDate daysToMature optimalConditions');
    
    const zoneWithPlants = {
      ...zone.toObject(),
      plants: plants
    };
    
    res.json(zoneWithPlants);
    
  } catch (error) {
    console.error('Error in getZoneById:', error);
    res.status(500).json({ 
      message: 'Error fetching zone', 
      error: error.message 
    });
  }
};

// دریافت گیاهان یک زون
export const getZonePlants = async (req, res) => {
  try {
    const plants = await Plant.find({ zone: req.params.id })
      .select('name type status currentStats plantingDate estimatedHarvestDate daysToMature optimalConditions');
    
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ایجاد داده اولیه برای زون‌ها
export const seedZones = async (_, res) => {
  try {
    const zonesData = [
      {
        name: 'Zone A',
        description: 'Tomato Zone',
        settings: {
          temperature: { min: 22, max: 28, optimal: 25 },
          humidity: { min: 50, max: 70, optimal: 60 },
          soilMoisture: { min: 40, max: 60, optimal: 50 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      {
        name: 'Zone B',
        description: 'Cucumber Zone',
        settings: {
          temperature: { min: 20, max: 30, optimal: 25 },
          humidity: { min: 60, max: 80, optimal: 70 },
          soilMoisture: { min: 50, max: 70, optimal: 60 },
          light: { min: 500, max: 900, optimal: 700 }
        }
      },
      {
        name: 'Zone C',
        description: 'Lettuce Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 55, max: 75, optimal: 65 },
          soilMoisture: { min: 45, max: 65, optimal: 55 },
          light: { min: 400, max: 800, optimal: 600 }
        }
      },
      {
        name: 'Zone D',
        description: 'Bell Pepper Zone',
        settings: {
          temperature: { min: 22, max: 32, optimal: 27 },
          humidity: { min: 50, max: 70, optimal: 60 },
          soilMoisture: { min: 40, max: 60, optimal: 50 },
          light: { min: 700, max: 1100, optimal: 900 }
        }
      }
    ];

    await Zone.deleteMany({});
    const zones = await Zone.insertMany(zonesData);
    
    res.json({ 
      message: 'Zones seeded successfully', 
      zones: zones.map(z => ({ id: z._id, name: z.name, description: z.description }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};