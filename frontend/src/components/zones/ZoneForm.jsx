// frontend/components/zones/ZoneForm.jsx
import { useState, useEffect } from 'react';
import { zonesService } from '../../services/api';

const ZoneForm = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    plantType: 'tomato',
  });

  const [nextZoneLetter, setNextZoneLetter] = useState('E');
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const calculateNextZone = async () => {
      try {
        const response = await zonesService.getAll();
        const zones = response.data?.zones || response || [];

        const existingLetters = zones
          .map(zone => {
            const match = zone.name?.match(/Zone (\w)/i);
            return match ? match[1].toUpperCase() : null;
          })
          .filter(Boolean);

        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        for (const letter of letters) {
          if (!existingLetters.includes(letter)) {
            setNextZoneLetter(letter);
            break;
          }
        }
      } catch (error) {
        console.error('Error calculating next zone:', error);
        setNextZoneLetter('E');
      }
    };

    calculateNextZone();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const zoneData = { plantType: formData.plantType };
      const response = await zonesService.create(zoneData);

      onSave(response);
      onClose();
    } catch (error) {
      console.error('Error creating zone:', error);
      alert('Error creating zone: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const selectedPlant = plantTypes.find(p => p.value === formData.plantType);

  return (
    <div className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header - Fixed */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 shrink-0">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Create New Zone
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
            New zone: <span className="font-semibold">Zone {nextZoneLetter}</span>
          </p>
        </div>

        {/* Scrollable Plant Selection */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <label className="block text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-4">
            Select Plant Type
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
            {plantTypes.map((type) => (
              <label
                key={type.value}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.plantType === type.value
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-sm'
                    : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500'
                }`}
              >
                <input
                  type="radio"
                  name="plantType"
                  value={type.value}
                  checked={formData.plantType === type.value}
                  onChange={(e) => setFormData({ ...formData, plantType: e.target.value })}
                  className="sr-only"
                />
                <span className="text-2xl mb-1">{type.emoji}</span>
                <span className="text-xs text-center text-zinc-700 dark:text-zinc-300">
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Fixed Footer: Summary + Buttons */}
        <div className="border-t border-zinc-200 dark:border-zinc-700 px-6 py-4 shrink-0">
          {/* Minimal Summary */}
          <div className="mb-4 p-4 border border-zinc-300 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
            <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Summary
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Zone Name</span>
                <span className="font-medium text-zinc-700">Zone {nextZoneLetter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Plant Type</span>
                <span className="font-medium flex items-center text-zinc-700 gap-2">
                  {selectedPlant?.emoji} {selectedPlant?.label}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition"
            >
              {loading ? 'Creating...' : 'Create Zone'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoneForm;