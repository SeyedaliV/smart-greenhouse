import Zone from '../models/zoneModel.js';
import Plant from '../models/plantModel.js';
import Device from '../models/deviceModel.js';
import Sensor from '../models/sensorModel.js';
import { createAuditLog } from './auditLogController.js';

export const getZones = async (req, res) => {
  try {
    const zones = await Zone.find().lean();

    const sensorAggregates = await Sensor.aggregate([
      {
        $match: {
          plant: null
        }
      },
      {
        $group: {
          _id: { zone: '$zone', type: '$type' },
          avgValue: { $avg: '$value' }
        }
      }
    ]);

    const envByZone = new Map();
    sensorAggregates.forEach((entry) => {
      const zoneId = entry._id.zone?.toString();
      if (!zoneId) return;
      if (!envByZone.has(zoneId)) {
        envByZone.set(zoneId, {});
      }
      const type = entry._id.type;
      envByZone.get(zoneId)[type] = Math.round(entry.avgValue * 10) / 10;
    });

    const zonesWithCounts = await Promise.all(
      zones.map(async (zone) => {
        const plantCount = await Plant.countDocuments({ zone: zone._id });
        const deviceCount = await Device.countDocuments({ zone: zone._id });
        const sensorCount = await Sensor.countDocuments({ zone: zone._id });

        const env = envByZone.get(zone._id.toString()) || {};

        const derivedStatus = plantCount === 0 ? 'inactive' : zone.status;

        return {
          ...zone,
          plantCount,
          deviceCount,
          sensorCount,
          status: derivedStatus,
          environment: {
            temperature: env.temperature || 0,
            humidity: env.humidity || 0,
            soilMoisture: env.soilMoisture || 0,
            light: env.light || 0,
          },
        };
      })
    );

    res.json(zonesWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createZone = async (req, res) => {
  try {
    const { plantType } = req.body;

    if (!plantType) {
      return res.status(400).json({
        status: 'error',
        message: 'plantType is required'
      });
    }

    // Calculate next zone name
    const existingZones = await Zone.find({}, 'name').lean();
    const existingLetters = existingZones
      .map(zone => {
        const match = zone.name?.match(/Zone (\w)/i);
        return match ? match[1].toUpperCase() : null;
      })
      .filter(Boolean);

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    let nextLetter = 'A';
    for (const letter of letters) {
      if (!existingLetters.includes(letter)) {
        nextLetter = letter;
        break;
      }
    }

    const zoneName = `Zone ${nextLetter}`;

    // Plant type settings
    const defaultSettings = {
      tomato: {
        description: 'Tomato Zone',
        settings: {
          temperature: { min: 22, max: 28, optimal: 25 },
          humidity: { min: 50, max: 70, optimal: 60 },
          soilMoisture: { min: 40, max: 60, optimal: 50 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      cucumber: {
        description: 'Cucumber Zone',
        settings: {
          temperature: { min: 20, max: 30, optimal: 25 },
          humidity: { min: 60, max: 80, optimal: 70 },
          soilMoisture: { min: 50, max: 70, optimal: 60 },
          light: { min: 500, max: 900, optimal: 700 }
        }
      },
      lettuce: {
        description: 'Lettuce Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 55, max: 75, optimal: 65 },
          soilMoisture: { min: 45, max: 65, optimal: 55 },
          light: { min: 400, max: 800, optimal: 600 }
        }
      },
      bellpepper: {
        description: 'Bell Pepper Zone',
        settings: {
          temperature: { min: 22, max: 32, optimal: 27 },
          humidity: { min: 50, max: 70, optimal: 60 },
          soilMoisture: { min: 40, max: 60, optimal: 50 },
          light: { min: 700, max: 1100, optimal: 900 }
        }
      },
      eggplant: {
        description: 'Eggplant Zone',
        settings: {
          temperature: { min: 24, max: 30, optimal: 27 },
          humidity: { min: 50, max: 70, optimal: 60 },
          soilMoisture: { min: 50, max: 70, optimal: 60 },
          light: { min: 800, max: 1200, optimal: 1000 }
        }
      },
      carrot: {
        description: 'Carrot Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 60, max: 80, optimal: 70 },
          soilMoisture: { min: 60, max: 80, optimal: 70 },
          light: { min: 400, max: 800, optimal: 600 }
        }
      },
      potato: {
        description: 'Potato Zone',
        settings: {
          temperature: { min: 15, max: 20, optimal: 17 },
          humidity: { min: 70, max: 90, optimal: 80 },
          soilMoisture: { min: 60, max: 80, optimal: 70 },
          light: { min: 200, max: 600, optimal: 400 }
        }
      },
      onion: {
        description: 'Onion Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 50, max: 70, optimal: 60 },
          soilMoisture: { min: 40, max: 60, optimal: 50 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      garlic: {
        description: 'Garlic Zone',
        settings: {
          temperature: { min: 12, max: 20, optimal: 16 },
          humidity: { min: 60, max: 80, optimal: 70 },
          soilMoisture: { min: 50, max: 70, optimal: 60 },
          light: { min: 400, max: 800, optimal: 600 }
        }
      },
      broccoli: {
        description: 'Broccoli Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 60, max: 80, optimal: 70 },
          soilMoisture: { min: 60, max: 80, optimal: 70 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      corn: {
        description: 'Corn Zone',
        settings: {
          temperature: { min: 20, max: 30, optimal: 25 },
          humidity: { min: 50, max: 70, optimal: 60 },
          soilMoisture: { min: 60, max: 80, optimal: 70 },
          light: { min: 800, max: 1200, optimal: 1000 }
        }
      },
      hotPepper: {
        description: 'Hot Pepper Zone',
        settings: {
          temperature: { min: 24, max: 32, optimal: 28 },
          humidity: { min: 50, max: 70, optimal: 60 },
          soilMoisture: { min: 50, max: 70, optimal: 60 },
          light: { min: 800, max: 1200, optimal: 1000 }
        }
      },
      avocado: {
        description: 'Avocado Zone',
        settings: {
          temperature: { min: 20, max: 30, optimal: 25 },
          humidity: { min: 60, max: 80, optimal: 70 },
          soilMoisture: { min: 50, max: 70, optimal: 60 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      banana: {
        description: 'Banana Zone',
        settings: {
          temperature: { min: 26, max: 32, optimal: 29 },
          humidity: { min: 70, max: 90, optimal: 80 },
          soilMoisture: { min: 60, max: 80, optimal: 70 },
          light: { min: 1000, max: 1500, optimal: 1200 }
        }
      },
      apple: {
        description: 'Apple Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 50, max: 70, optimal: 60 },
          soilMoisture: { min: 50, max: 70, optimal: 60 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      orange: {
        description: 'Orange Zone',
        settings: {
          temperature: { min: 20, max: 30, optimal: 25 },
          humidity: { min: 50, max: 70, optimal: 60 },
          soilMoisture: { min: 50, max: 70, optimal: 60 },
          light: { min: 800, max: 1200, optimal: 1000 }
        }
      },
      lemon: {
        description: 'Lemon Zone',
        settings: {
          temperature: { min: 20, max: 30, optimal: 25 },
          humidity: { min: 50, max: 70, optimal: 60 },
          soilMoisture: { min: 50, max: 70, optimal: 60 },
          light: { min: 800, max: 1200, optimal: 1000 }
        }
      },
      grapes: {
        description: 'Grapes Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 40, max: 60, optimal: 50 },
          soilMoisture: { min: 40, max: 60, optimal: 50 },
          light: { min: 800, max: 1200, optimal: 1000 }
        }
      },
      watermelon: {
        description: 'Watermelon Zone',
        settings: {
          temperature: { min: 20, max: 30, optimal: 25 },
          humidity: { min: 50, max: 70, optimal: 60 },
          soilMoisture: { min: 60, max: 80, optimal: 70 },
          light: { min: 800, max: 1200, optimal: 1000 }
        }
      },
      strawberry: {
        description: 'Strawberry Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 60, max: 80, optimal: 70 },
          soilMoisture: { min: 60, max: 80, optimal: 70 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      blueberries: {
        description: 'Blueberries Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 60, max: 80, optimal: 70 },
          soilMoisture: { min: 50, max: 70, optimal: 60 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      cherries: {
        description: 'Cherries Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 50, max: 70, optimal: 60 },
          soilMoisture: { min: 50, max: 70, optimal: 60 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      peach: {
        description: 'Peach Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 50, max: 70, optimal: 60 },
          soilMoisture: { min: 50, max: 70, optimal: 60 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      mango: {
        description: 'Mango Zone',
        settings: {
          temperature: { min: 24, max: 32, optimal: 28 },
          humidity: { min: 60, max: 80, optimal: 70 },
          soilMoisture: { min: 50, max: 70, optimal: 60 },
          light: { min: 800, max: 1200, optimal: 1000 }
        }
      },
      pineapple: {
        description: 'Pineapple Zone',
        settings: {
          temperature: { min: 23, max: 32, optimal: 27 },
          humidity: { min: 60, max: 80, optimal: 70 },
          soilMoisture: { min: 50, max: 70, optimal: 60 },
          light: { min: 800, max: 1200, optimal: 1000 }
        }
      },
      coconut: {
        description: 'Coconut Zone',
        settings: {
          temperature: { min: 25, max: 35, optimal: 30 },
          humidity: { min: 70, max: 90, optimal: 80 },
          soilMoisture: { min: 60, max: 80, optimal: 70 },
          light: { min: 1000, max: 1500, optimal: 1200 }
        }
      },
      kiwi: {
        description: 'Kiwi Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 70, max: 90, optimal: 80 },
          soilMoisture: { min: 60, max: 80, optimal: 70 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      spinach: {
        description: 'Spinach Zone',
        settings: {
          temperature: { min: 10, max: 20, optimal: 15 },
          humidity: { min: 60, max: 80, optimal: 70 },
          soilMoisture: { min: 60, max: 80, optimal: 70 },
          light: { min: 400, max: 800, optimal: 600 }
        }
      },
      kale: {
        description: 'Kale Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 60, max: 80, optimal: 70 },
          soilMoisture: { min: 60, max: 80, optimal: 70 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      cabbage: {
        description: 'Cabbage Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 60, max: 80, optimal: 70 },
          soilMoisture: { min: 60, max: 80, optimal: 70 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      mushroom: {
        description: 'Mushroom Zone',
        settings: {
          temperature: { min: 12, max: 18, optimal: 15 },
          humidity: { min: 85, max: 95, optimal: 90 },
          soilMoisture: { min: 70, max: 90, optimal: 80 },
          light: { min: 50, max: 200, optimal: 100 }
        }
      },
      peanuts: {
        description: 'Peanuts Zone',
        settings: {
          temperature: { min: 20, max: 30, optimal: 25 },
          humidity: { min: 50, max: 70, optimal: 60 },
          soilMoisture: { min: 40, max: 60, optimal: 50 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      chestnut: {
        description: 'Chestnut Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 60, max: 80, optimal: 70 },
          soilMoisture: { min: 50, max: 70, optimal: 60 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      olive: {
        description: 'Olive Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 40, max: 60, optimal: 50 },
          soilMoisture: { min: 30, max: 50, optimal: 40 },
          light: { min: 800, max: 1200, optimal: 1000 }
        }
      },
      wheat: {
        description: 'Wheat Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 50, max: 70, optimal: 60 },
          soilMoisture: { min: 50, max: 70, optimal: 60 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      rice: {
        description: 'Rice Zone',
        settings: {
          temperature: { min: 20, max: 35, optimal: 27 },
          humidity: { min: 70, max: 90, optimal: 80 },
          soilMoisture: { min: 80, max: 100, optimal: 90 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      herbs: {
        description: 'Herbs Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 50, max: 70, optimal: 60 },
          soilMoisture: { min: 50, max: 70, optimal: 60 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      basil: {
        description: 'Basil Zone',
        settings: {
          temperature: { min: 20, max: 30, optimal: 25 },
          humidity: { min: 50, max: 70, optimal: 60 },
          soilMoisture: { min: 50, max: 70, optimal: 60 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      mint: {
        description: 'Mint Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 60, max: 80, optimal: 70 },
          soilMoisture: { min: 50, max: 70, optimal: 60 },
          light: { min: 400, max: 800, optimal: 600 }
        }
      },
      rosemary: {
        description: 'Rosemary Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 40, max: 60, optimal: 50 },
          soilMoisture: { min: 30, max: 50, optimal: 40 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      thyme: {
        description: 'Thyme Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 40, max: 60, optimal: 50 },
          soilMoisture: { min: 30, max: 50, optimal: 40 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      lavender: {
        description: 'Lavender Zone',
        settings: {
          temperature: { min: 15, max: 25, optimal: 20 },
          humidity: { min: 40, max: 60, optimal: 50 },
          soilMoisture: { min: 30, max: 50, optimal: 40 },
          light: { min: 600, max: 1000, optimal: 800 }
        }
      },
      default: {
        description: `${plantType.charAt(0).toUpperCase() + plantType.slice(1)} Zone`,
        settings: {
          temperature: { min: 18, max: 30, optimal: 24 },
          humidity: { min: 50, max: 80, optimal: 65 },
          soilMoisture: { min: 40, max: 70, optimal: 55 },
          light: { min: 500, max: 1000, optimal: 750 }
        }
      }
    };

    const config = defaultSettings[plantType] || defaultSettings.default;
    const { description, settings } = config;
    const newZone = await Zone.create({
      name: zoneName,
      plantType,
      description,
      settings,
      status: 'active'
    });

    res.status(201).json({
      status: 'success',
      data: { zone: newZone }
    });
  } catch (error) {
    console.error('Error creating zone:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getZoneById = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id);

    if (!zone) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    const plants = await Plant.find({ zone: req.params.id })
      .select('name type status currentStats plantingDate estimatedHarvestDate daysToMature optimalConditions');

    const sensorEnvAggregates = await Sensor.aggregate([
      {
        $match: {
          zone: zone._id,
          plant: null,
        },
      },
      {
        $group: {
          _id: '$type',
          avgValue: { $avg: '$value' },
        },
      },
    ]);

    const env = {};
    sensorEnvAggregates.forEach((entry) => {
      env[entry._id] = Math.round(entry.avgValue * 10) / 10;
    });

    const derivedStatus = plants.length === 0 ? 'inactive' : zone.status;

    const zoneWithPlants = {
      ...zone.toObject(),
      status: derivedStatus,
      plants: plants,
      environment: {
        temperature: env.temperature || 0,
        humidity: env.humidity || 0,
        soilMoisture: env.soilMoisture || 0,
        light: env.light || 0,
      },
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

export const getZonePlants = async (req, res) => {
  try {
    const plants = await Plant.find({ zone: req.params.id })
      .select('name type status currentStats plantingDate estimatedHarvestDate daysToMature optimalConditions');
    
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteZone = async (req, res) => {
  try {
    const { id: zoneId } = req.params;
    console.log('🗑️ Attempting to delete zone with ID:', zoneId);

    const deletedDevices = await Device.deleteMany({ zone: zoneId });
    const deletedSensors = await Sensor.deleteMany({ zone: zoneId });
    const deletedPlants = await Plant.deleteMany({ zone: zoneId });
    console.log(`🗑️ Deleted ${deletedDevices.deletedCount} devices, ${deletedSensors.deletedCount} sensors, and ${deletedPlants.deletedCount} plants`);

    const zone = await Zone.findByIdAndDelete(zoneId);

    if (!zone) {
      console.log('❌ Zone not found with ID:', zoneId);
      return res.status(404).json({
        status: 'error',
        message: 'Zone not found'
      });
    }

    // Audit log for zone deletion
    await createAuditLog({
      req,
      actionType: 'ZONE_DELETE',
      entityType: 'Zone',
      entityId: zone._id.toString(),
      entityName: zone.name,
      description: 'Deleted zone and all associated resources',
      meta: {
        deletedDevices: deletedDevices.deletedCount,
        deletedSensors: deletedSensors.deletedCount,
        deletedPlants: deletedPlants.deletedCount,
        plantType: zone.plantType,
      },
    });

    console.log('✅ Zone deleted successfully:', zone.name);
    res.status(200).json({
      status: 'success',
      message: 'Zone deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting zone:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

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
