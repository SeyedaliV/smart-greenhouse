import { useState, useEffect } from 'react';
import { zonesService } from '../../services/api';

const ZoneForm = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    plantType: 'tomato',
    sensors: {
      temperature: 0,
      humidity: 0,
      soilMoisture: 0,
      light: 0
    }
  });

  const [nextZoneLetter, setNextZoneLetter] = useState('E');

  const plantTypes = [
    { value: 'tomato', label: 'Tomato', emoji: '🍅' },
    { value: 'cucumber', label: 'Cucumber', emoji: '🥒' },
    { value: 'lettuce', label: 'Lettuce', emoji: '🥬' },
    { value: 'bellpepper', label: 'Bell Pepper', emoji: '🫑' },
    { value: 'eggplant', label: 'Eggplant', emoji: '🍆' },
    { value: 'carrot', label: 'Carrot', emoji: '🥕' },
    { value: 'potato', label: 'Potato', emoji: '🥔' },
    { value: 'onion', label: 'Onion', emoji: '🧅' },
    { value: 'garlic', label: 'Garlic', emoji: '🧄' },
    { value: 'broccoli', label: 'Broccoli', emoji: '🥦' },
    { value: 'corn', label: 'Corn', emoji: '🌽' },
    { value: 'hotPepper', label: 'Hot Pepper', emoji: '🌶️' },
    { value: 'avocado', label: 'Avocado', emoji: '🥑' },
    { value: 'banana', label: 'Banana', emoji: '🍌' },
    { value: 'apple', label: 'Apple', emoji: '🍎' },
    { value: 'orange', label: 'Orange', emoji: '🍊' },
    { value: 'lemon', label: 'Lemon', emoji: '🍋' },
    { value: 'grapes', label: 'Grapes', emoji: '🍇' },
    { value: 'watermelon', label: 'Watermelon', emoji: '🍉' },
    { value: 'strawberry', label: 'Strawberry', emoji: '🍓' },
    { value: 'blueberries', label: 'Blueberries', emoji: '🫐' },
    { value: 'cherries', label: 'Cherries', emoji: '🍒' },
    { value: 'peach', label: 'Peach', emoji: '🍑' },
    { value: 'mango', label: 'Mango', emoji: '🥭' },
    { value: 'pineapple', label: 'Pineapple', emoji: '🍍' },
    { value: 'coconut', label: 'Coconut', emoji: '🥥' },
    { value: 'kiwi', label: 'Kiwi', emoji: '🥝' },
    { value: 'spinach', label: 'Spinach', emoji: '🥬' },
    { value: 'kale', label: 'Kale', emoji: '🥬' },
    { value: 'cabbage', label: 'Cabbage', emoji: '🥬' },
    { value: 'mushroom', label: 'Mushroom', emoji: '🍄' },
    { value: 'peanuts', label: 'Peanuts', emoji: '🥜' },
    { value: 'chestnut', label: 'Chestnut', emoji: '🌰' },
    { value: 'olive', label: 'Olive', emoji: '🫒' },
    { value: 'wheat', label: 'Wheat', emoji: '🌾' },
    { value: 'rice', label: 'Rice', emoji: '🌾' },
    { value: 'herbs', label: 'Herbs', emoji: '🌿' },
    { value: 'basil', label: 'Basil', emoji: '🌿' },
    { value: 'mint', label: 'Mint', emoji: '🌿' },
    { value: 'rosemary', label: 'Rosemary', emoji: '🌿' },
    { value: 'thyme', label: 'Thyme', emoji: '🌿' },
    { value: 'lavender', label: 'Lavender', emoji: '🌿' }
  ];



  const sensorTypes = [
    { value: 'temperature', label: 'Temperature Sensor (°C)' },
    { value: 'humidity', label: 'Humidity Sensor (%)' },
    { value: 'soilMoisture', label: 'Soil Moisture Sensor (%)' },
    { value: 'light', label: 'Light Sensor (lux)' }
  ];

  useEffect(() => {
    // Calculate next zone letter
    const calculateNextZone = async () => {
      try {
        const zones = await zonesService.getAll();
        const existingLetters = zones.map(zone => {
          const match = zone.name.match(/Zone (\w)/);
          return match ? match[1] : null;
        }).filter(Boolean);

        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

        for (const letter of letters) {
          if (!existingLetters.includes(letter)) {
            setNextZoneLetter(letter);
            break;
          }
        }
      } catch (error) {
        console.error('Error calculating next zone:', error);
        setNextZoneLetter('E'); // fallback
      }
    };

    calculateNextZone();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const zoneData = {
        plantType: formData.plantType,
        sensors: formData.sensors
      };

      const response = await zonesService.create(zoneData);

      console.log('✅ Zone created:', response);
      onSave(response);
    } catch (error) {
      console.error('❌ Error creating zone:', error);
      alert('Error creating zone: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSensorChange = (sensorType, value) => {
    setFormData({
      ...formData,
      sensors: {
        ...formData.sensors,
        [sensorType]: parseInt(value) || 0
      }
    });
  };

  const getTotalSensors = () => {
    return Object.values(formData.sensors).reduce((sum, count) => sum + count, 0);
  };

  const selectedPlantType = plantTypes.find(type => type.value === formData.plantType);

  return (
    <div className="fixed h-screen inset-0 backdrop-brightness-50 dark:backdrop-brightness-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Create New Zone
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Zone {nextZoneLetter} will be created automatically
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Plant Type Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Plant Type
            </label>
            <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {plantTypes.map(type => (
                <label key={type.value} className="flex items-center space-x-3 p-3 border border-zinc-200 dark:border-zinc-600 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700">
                  <input
                    type="radio"
                    name="plantType"
                    value={type.value}
                    checked={formData.plantType === type.value}
                    onChange={(e) => setFormData({...formData, plantType: e.target.value})}
                    className="text-green-500 focus:ring-green-500"
                  />
                  <span className="text-lg">{type.emoji}</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">{type.label}</span>
                </label>
              ))}
            </div>
          </div>



          {/* Sensor Configuration */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Sensor Configuration ({getTotalSensors()} total)
            </label>
            <div className="space-y-3">
              {sensorTypes.map(sensorType => (
                <div key={sensorType.value} className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-600 rounded-lg">
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">{sensorType.label}</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.sensors[sensorType.value]}
                    onChange={(e) => handleSensorChange(sensorType.value, e.target.value)}
                    className="w-20 text-center text-zinc-700 dark:text-zinc-200 px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-zinc-700"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Zone Summary</h4>
            <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <div>• Zone: Zone {nextZoneLetter}</div>
              <div>• Plant Type: {selectedPlantType?.label}</div>
              <div>• Total Sensors: {getTotalSensors()}</div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-800 dark:hover:text-white transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200 font-medium"
            >
              Create Zone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ZoneForm;
