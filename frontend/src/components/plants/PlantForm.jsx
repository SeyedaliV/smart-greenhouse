import { useState, useEffect, useMemo } from 'react';
import { plantsService } from '../../services/api';

const PlantForm = ({ plant, onClose, onSave, zones }) => {
  // Helper function to get plant emoji
  const getPlantEmoji = (plantType) => {
    const emojiMap = {
      tomato: '🍅',
      cucumber: '🥒',
      lettuce: '🥬',
      bellpepper: '🫑',
      eggplant: '🍆',
      carrot: '🥕',
      potato: '🥔',
      onion: '🧅',
      garlic: '🧄',
      broccoli: '🥦',
      corn: '🌽',
      hotPepper: '🌶️',
      avocado: '🥑',
      banana: '🍌',
      apple: '🍎',
      orange: '🍊',
      lemon: '🍋',
      grapes: '🍇',
      watermelon: '🍉',
      strawberry: '🍓',
      blueberries: '🫐',
      cherries: '🍒',
      peach: '🍑',
      mango: '🥭',
      pineapple: '🍍',
      coconut: '🥥',
      kiwi: '🥝',
      spinach: '🥬',
      kale: '🥬',
      cabbage: '🥬',
      mushroom: '🍄',
      peanuts: '🥜',
      chestnut: '🌰',
      olive: '🫒',
      wheat: '🌾',
      rice: '🌾',
      herbs: '🌿',
      basil: '🌿',
      mint: '🌿',
      rosemary: '🌿',
      thyme: '🌿',
      lavender: '🌿'
    };
    return emojiMap[plantType] || '🌱';
  };

  // Helper function to get days to mature
  const getPlantDaysToMature = (plantType) => {
    const daysMap = {
      tomato: 70, cucumber: 55, lettuce: 45, bellpepper: 75, eggplant: 80,
      carrot: 75, potato: 90, onion: 100, garlic: 90, broccoli: 70, corn: 85,
      hotPepper: 80, avocado: 365, banana: 365, apple: 150, orange: 365,
      lemon: 365, grapes: 150, watermelon: 80, strawberry: 60, blueberries: 90,
      cherries: 60, peach: 140, mango: 365, pineapple: 365, coconut: 365,
      kiwi: 180, spinach: 45, kale: 60, cabbage: 80, mushroom: 30,
      peanuts: 120, chestnut: 180, olive: 180, wheat: 120, rice: 120,
      herbs: 60, basil: 60, mint: 90, rosemary: 90, thyme: 75, lavender: 100
    };
    return daysMap[plantType] || 60;
  };

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    plantingDate: new Date().toISOString().split('T')[0],
  });

  // Create plant types from zones that exist and have plantType
  const plantTypes = useMemo(() => zones
    .filter(zone => zone.plantType) // Only include zones that have plantType
    .map(zone => ({
      value: zone.plantType,
      label: `${zone.plantType.charAt(0).toUpperCase() + zone.plantType.slice(1)} ${getPlantEmoji(zone.plantType)}`,
      daysToMature: getPlantDaysToMature(zone.plantType),
      zoneId: zone._id,
      zoneName: zone.name
    })), [zones]);

  useEffect(() => {
    if (plant) {
      setFormData({
        name: plant.name,
        type: plant.type,
        plantingDate: new Date(plant.plantingDate).toISOString().split('T')[0]
      });
    }
  }, [plant]);

  // Auto-select zone when plant type changes
  useEffect(() => {
    if (formData.type && plantTypes.length > 0) {
      const selectedPlantType = plantTypes.find(type => type.value === formData.type);
      if (selectedPlantType) {
        setFormData(prev => ({
          ...prev,
          zone: selectedPlantType.zoneId
        }));
      }
    }
  }, [formData.type, plantTypes]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const selectedType = plantTypes.find(type => type.value === formData.type);
      if (!selectedType) {
        throw new Error('Selected plant type not found');
      }

      const plantingDate = new Date(formData.plantingDate);
      const estimatedHarvestDate = new Date(plantingDate);
      estimatedHarvestDate.setDate(estimatedHarvestDate.getDate() + selectedType.daysToMature);

      const plantData = {
        name: formData.name,
        type: formData.type,
        plantingDate: plantingDate.toISOString(),
        daysToMature: selectedType.daysToMature,
        estimatedHarvestDate: estimatedHarvestDate.toISOString(),
        status: 'optimal',
        zone: formData.zone
      };

      console.log('🌱 Saving plant:', plantData);
      console.log('Selected plant type:', selectedType);

      if (plant) {
        await plantsService.update(plant._id, plantData);
      } else {
        await plantsService.create(plantData);
      }

      onSave(plantData);
    } catch (error) {
      console.error('Error saving plant:', error);
      console.error('Error details:', error.response?.data);
      alert('Error saving plant: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const selectedPlantType = plantTypes.find(type => type.value === formData.type);

  return (
    <div className="fixed h-screen inset-0 backdrop-brightness-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            {plant ? 'Edit Plant' : 'Add New Plant'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {plantTypes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-zinc-400 text-4xl mb-4">🏗️</div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">No zones available</h3>
              <p className="text-zinc-600 dark:text-gray-400 mb-4">
                You need to create zones first before you can add plants.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200"
              >
                Go to Zones
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Plant Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full text-zinc-700 dark:text-zinc-200 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-zinc-700"
                  placeholder="Enter plant name"
                  required
                />
              </div>

              {/* Only show plant type selection when creating new plant (not editing) */}
              {!plant && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Plant Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full text-zinc-700 dark:text-zinc-200 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-zinc-700"
                    required
                  >
                    <option value="">Select a plant type</option>
                    {plantTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} ({type.daysToMature} days to harvest)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Show plant type as read-only when editing */}
              {plant && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Plant Type
                  </label>
                  <div className="w-full text-zinc-700 dark:text-zinc-200 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-700">
                    {plantTypes.find(type => type.value === formData.type)?.label || formData.type}
                  </div>
                </div>
              )}

              {selectedPlantType && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Assigned Zone
                  </label>
                  <div className="w-full text-zinc-700 dark:text-zinc-200 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-700">
                    {selectedPlantType.zoneName} - {zones.find(z => z._id === selectedPlantType.zoneId)?.description}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Planting Date
                </label>
                <input
                  type="date"
                  name="plantingDate"
                  value={formData.plantingDate}
                  onChange={handleChange}
                  className="w-full text-zinc-700 dark:text-zinc-200 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-zinc-700"
                  required
                />
              </div>

              {selectedPlantType && (
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Plant Information</h4>
                  <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <div>• Days to harvest: {selectedPlantType.daysToMature} days</div>
                    <div>• Estimated harvest: {
                      new Date(new Date(formData.plantingDate).getTime() + selectedPlantType.daysToMature * 24 * 60 * 60 * 1000)
                        .toLocaleDateString()
                    }</div>
                  </div>
                </div>
              )}

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
                  {plant ? 'Update Plant' : 'Add Plant'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default PlantForm;
