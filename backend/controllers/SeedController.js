import Zone from '../models/zoneModel.js';
import Plant from '../models/plantModel.js';
import Device from '../models/deviceModel.js';
import Sensor from '../models/sensorModel.js';

export const Seed = async (_, res) => {
  try {
    console.log('Cleaning all existing data...');
    
    await Plant.deleteMany({});
    await Device.deleteMany({});
    await Sensor.deleteMany({});
    await Zone.deleteMany({});

    try {
      await Plant.collection.dropIndex('type_1');
      console.log('Plant index dropped');
    } catch (e) {
      console.log('Plant index already dropped');
    }

    console.log('Creating zones...');
    
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

    const zones = await Zone.insertMany(zonesData);
    console.log(`${zones.length} zones created`);

    console.log('Creating devices...');
    
    const devicesData = [];
    const deviceTypes = ['waterPump', 'fan', 'light', 'heater'];
    const deviceNames = {
      waterPump: 'Water Pump',
      fan: 'Ventilation Fan', 
      light: 'Grow Light',
      heater: 'Heating System'
    };

    for (const zone of zones) {
      for (const deviceType of deviceTypes) {
        devicesData.push({
          name: `${deviceNames[deviceType]} ${zone.name}`,
          type: deviceType,
          status: 'OFF',
          powerConsumption: Math.floor(Math.random() * 100) + 50,
          zone: zone.name,
          lastAction: new Date()
        });
      }
    }

    const devices = await Device.insertMany(devicesData);
    console.log(`${devices.length} devices created`);

    console.log('Creating plants...');
    
    const plantsData = [];
    const plantTypes = {
      'Zone A': 'tomato',
      'Zone B': 'cucumber', 
      'Zone C': 'lettuce',
      'Zone D': 'bellpepper'
    };

    const plantNames = {
      tomato: ['Cherry Tomato', 'Beefsteak Tomato', 'Roma Tomato'],
      cucumber: ['Persian Cucumber', 'European Cucumber', 'Mini Cucumber'],
      lettuce: ['Iceberg Lettuce', 'Romaine Lettuce', 'Leaf Lettuce'],
      bellpepper: ['Bell Pepper', 'Jalapeno Pepper', 'Sweet Pepper']
    };

    const daysToMatureMap = {
      tomato: 70,
      cucumber: 55,
      lettuce: 45,
      bellpepper: 75
    };

    for (const zone of zones) {
      const plantType = plantTypes[zone.name];
      const names = plantNames[plantType];
      const daysToMature = daysToMatureMap[plantType];
      
      // ایجاد ۲ تا ۳ گیاه در هر زون
      const plantCount = Math.floor(Math.random() * 2) + 2; // 2 or 3 plants
      
      for (let i = 0; i < plantCount; i++) {
        const plantingDate = new Date(Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000);
        const estimatedHarvestDate = new Date(plantingDate);
        estimatedHarvestDate.setDate(estimatedHarvestDate.getDate() + daysToMature);

        // ایجاد داده‌های واقعی برای گیاه
        const tempVariation = (Math.random() * 4 - 2); // ±2°C
        const humidityVariation = (Math.random() * 10 - 5); // ±5%
        const soilVariation = (Math.random() * 8 - 4); // ±4%
        const lightVariation = (Math.random() * 150 - 75); // ±75 lux

        plantsData.push({
          name: names[i],
          type: plantType,
          zone: zone._id,
          plantingDate: plantingDate,
          daysToMature: daysToMature,
          estimatedHarvestDate: estimatedHarvestDate,
          status: Math.random() > 0.8 ? 'needs_attention' : 'optimal',
          optimalConditions: {
            temperature: { min: zone.settings.temperature.min, max: zone.settings.temperature.max },
            humidity: { min: zone.settings.humidity.min, max: zone.settings.humidity.max },
            soilMoisture: { min: zone.settings.soilMoisture.min, max: zone.settings.soilMoisture.max },
            light: { min: zone.settings.light.min, max: zone.settings.light.max },
            daysToMature: daysToMature
          },
          currentStats: {
            temperature: Math.round((zone.settings.temperature.optimal + tempVariation) * 10) / 10,
            humidity: Math.round(zone.settings.humidity.optimal + humidityVariation),
            soilMoisture: Math.round(zone.settings.soilMoisture.optimal + soilVariation),
            light: Math.round(zone.settings.light.optimal + lightVariation),
            lastUpdated: new Date()
          }
        });
      }
    }

    const plants = await Plant.insertMany(plantsData);
    console.log(`${plants.length} plants created`);

    console.log('Creating sensors...');
    
    const sensorsData = [];
    const sensorTypes = [
      { type: 'temperature', unit: '°C', name: 'Temperature Sensor' },
      { type: 'humidity', unit: '%', name: 'Humidity Sensor' },
      { type: 'soilMoisture', unit: '%', name: 'Soil Moisture Sensor' },
      { type: 'light', unit: 'lux', name: 'Light Sensor' }
    ];

    const zonePlantTypes = {
      'Zone A': 'tomato',
      'Zone B': 'cucumber', 
      'Zone C': 'lettuce',
      'Zone D': 'bellpepper'
    };

    for (const zone of zones) {
      for (const sensorConfig of sensorTypes) {
        const baseValue = zone.settings[sensorConfig.type]?.optimal || 50;
        
        // ایجاد داده‌های واقعی و تمیز برای سنسورها
        let currentValue;
        
        switch(sensorConfig.type) {
          case 'temperature':
            currentValue = baseValue + (Math.random() * 4 - 2); // ±2°C
            currentValue = Math.round(currentValue * 10) / 10; // یک رقم اعشار
            break;
          case 'humidity':
            currentValue = baseValue + (Math.random() * 10 - 5); // ±5%
            currentValue = Math.round(currentValue); // عدد صحیح
            break;
          case 'soilMoisture':
            currentValue = baseValue + (Math.random() * 8 - 4); // ±4%
            currentValue = Math.round(currentValue); // عدد صحیح
            break;
          case 'light':
            currentValue = baseValue + (Math.random() * 200 - 100); // ±100 lux
            currentValue = Math.round(currentValue / 10) * 10; // مضرب ۱۰
            break;
          default:
            currentValue = Math.round(baseValue);
        }

        const sensorData = {
          name: `${sensorConfig.name} ${zone.name}`,
          type: sensorConfig.type,
          unit: sensorConfig.unit,
          value: currentValue,
          zone: zone.name,
          status: 'active',
          lastUpdate: new Date()
        };

        if (sensorConfig.type === 'soilMoisture') {
          sensorData.plantType = zonePlantTypes[zone.name];
        }

        sensorsData.push(sensorData);
      }
    }

    const sensors = await Sensor.insertMany(sensorsData);
    console.log(`${sensors.length} sensors created`);

    console.log('Linking data...');
    
    for (const zone of zones) {
      const zonePlants = plants.filter(p => p.zone.toString() === zone._id.toString());
      zone.plants = zonePlants.map(p => p._id);
      await zone.save();
    }

    console.log('Seed completed!');

    res.json({
      message: 'Complete greenhouse system created successfully with clean data!',
      summary: {
        zones: zones.length,
        plants: plants.length, 
        devices: devices.length,
        sensors: sensors.length,
        plantsPerZone: '2-3 plants',
        devicesPerZone: 4,
        sensorsPerZone: 4
      },
      zones: zones.map(z => ({
        name: z.name,
        description: z.description,
        plants: z.plants.length,
        devices: 4,
        sensors: 4
      }))
    });

  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ 
      message: 'Error creating seed data',
      error: error.message 
    });
  }
};