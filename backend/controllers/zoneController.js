import Zone from '../models/zoneModel.js';
import Plant from '../models/plantModel.js';
import Device from '../models/deviceModel.js';
import Sensor from '../models/sensorModel.js';

// دریافت همه زون‌ها به همراه تعداد دقیق گیاهان هر زون
export const getZones = async (req, res) => {
  try {
    // همه‌ی زون‌ها را بگیر
    const zones = await Zone.find().lean();

    // برای هر زون تعداد گیاهان، دستگاه‌ها و سنسورها را حساب کن
    const zonesWithCounts = await Promise.all(
      zones.map(async (zone) => {
        const plantCount = await Plant.countDocuments({ zone: zone._id });
        const deviceCount = await Device.countDocuments({ zone: zone._id });
        const sensorCount = await Sensor.countDocuments({ zone: zone._id });
        return {
          ...zone,
          plantCount,
          deviceCount,
          sensorCount,
        };
      })
    );

    res.json(zonesWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ایجاد زون جدید با دستگاه‌ها و سنسورها
export const createZone = async (req, res) => {
  try {
    const { plantType, sensors } = req.body;

    // Calculate next zone name
    const existingZones = await Zone.find({}, 'name').lean();
    const existingLetters = existingZones.map(zone => {
      const match = zone.name.match(/Zone (\w)/);
      return match ? match[1] : null;
    }).filter(Boolean);

    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    let nextLetter = 'E'; // fallback
    for (const letter of letters) {
      if (!existingLetters.includes(letter)) {
        nextLetter = letter;
        break;
      }
    }

    const zoneName = `Zone ${nextLetter}`;

    // Plant type settings
    const plantSettings = {
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
      }
    };

    const plantConfig = plantSettings[plantType];

    // Create zone
    const zone = new Zone({
      name: zoneName,
      plantType,
      description: plantConfig.description,
      settings: plantConfig.settings,
      status: 'active'
    });

    await zone.save();

    // Create sensors
    const sensorPromises = [];
    const sensorTypes = ['temperature', 'humidity', 'soilMoisture', 'light'];

    for (const sensorType of sensorTypes) {
      const count = sensors[sensorType] || 0;
      for (let i = 1; i <= count; i++) {
        const sensorNameMap = {
          temperature: 'Temperature Sensor',
          humidity: 'Humidity Sensor',
          soilMoisture: 'Soil Moisture Sensor',
          light: 'Light Sensor'
        };

        const unitMap = {
          temperature: '°C',
          humidity: '%',
          soilMoisture: '%',
          light: 'lux'
        };

        const baseName = sensorNameMap[sensorType];
        const sensorName = `${baseName} ${i}`;

        // Set initial values based on optimal settings
        let initialValue;
        switch (sensorType) {
          case 'temperature':
            initialValue = plantConfig.settings.temperature.optimal;
            break;
          case 'humidity':
            initialValue = plantConfig.settings.humidity.optimal;
            break;
          case 'soilMoisture':
            initialValue = plantConfig.settings.soilMoisture.optimal;
            break;
          case 'light':
            initialValue = plantConfig.settings.light.optimal;
            break;
          default:
            initialValue = 0;
        }

        sensorPromises.push(
          Sensor.create({
            name: sensorName,
            type: sensorType,
            value: initialValue,
            unit: unitMap[sensorType],
            zone: zone._id,
            status: 'active',
            plantType: sensorType === 'soilMoisture' ? plantType : undefined,
            lastUpdate: new Date()
          })
        );
      }
    }

    // Execute sensor creations
    await Promise.all(sensorPromises);

    // Return zone with counts
    const deviceCount = await Device.countDocuments({ zone: zone._id });
    const sensorCount = await Sensor.countDocuments({ zone: zone._id });

    const zoneWithCounts = {
      ...zone.toObject(),
      deviceCount,
      sensorCount
    };

    res.status(201).json(zoneWithCounts);
  } catch (error) {
    console.error('Error creating zone:', error);
    res.status(500).json({ message: error.message });
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

// حذف زون
export const deleteZone = async (req, res) => {
  try {
    const { id: zoneId } = req.params;
    console.log('🗑️ Attempting to delete zone with ID:', zoneId);

    // اول دستگاه‌ها، سنسورها و گیاهان مربوط به این زون رو حذف کن
    const deletedDevices = await Device.deleteMany({ zone: zoneId });
    const deletedSensors = await Sensor.deleteMany({ zone: zoneId });
    const deletedPlants = await Plant.deleteMany({ zone: zoneId });
    console.log(`🗑️ Deleted ${deletedDevices.deletedCount} devices, ${deletedSensors.deletedCount} sensors, and ${deletedPlants.deletedCount} plants`);

    // حالا خود زون رو حذف کن
    const zone = await Zone.findByIdAndDelete(zoneId);

    if (!zone) {
      console.log('❌ Zone not found with ID:', zoneId);
      return res.status(404).json({
        status: 'error',
        message: 'Zone not found'
      });
    }

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
