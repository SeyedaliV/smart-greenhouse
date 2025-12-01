import { useState, useEffect } from 'react';
import { plantsService } from '../../services/api';

const PlantForm = ({ plant, onClose, onSave, zones }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'tomato',
    plantingDate: new Date().toISOString().split('T')[0],
  });

  const plantTypeToZone = {
    tomato: 'Zone A',
    cucumber: 'Zone B', 
    lettuce: 'Zone C',
    bellpepper: 'Zone D'
  };

  const plantTypes = [
    { value: 'tomato', label: 'Tomato', daysToMature: 70 },
    { value: 'cucumber', label: 'Cucumber', daysToMature: 55 },
    { value: 'lettuce', label: 'Lettuce', daysToMature: 45 },
    { value: 'bellpepper', label: 'Bell Pepper', daysToMature: 75 }
  ];

  useEffect(() => {
    if (plant) {
      setFormData({
        name: plant.name,
        type: plant.type,
        plantingDate: new Date(plant.plantingDate).toISOString().split('T')[0]
      });
    }
  }, [plant]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const selectedType = plantTypes.find(type => type.value === formData.type);
      const plantingDate = new Date(formData.plantingDate);
      const estimatedHarvestDate = new Date(plantingDate);
      estimatedHarvestDate.setDate(estimatedHarvestDate.getDate() + selectedType.daysToMature);

      // پیدا کردن zone بر اساس نوع گیاه
      const targetZoneName = plantTypeToZone[formData.type];
      const targetZone = zones.find(zone => zone.name === targetZoneName);
      
      if (!targetZone) {
        throw new Error(`Zone ${targetZoneName} not found`);
      }

      const plantData = {
        name: formData.name,
        type: formData.type,
        plantingDate: plantingDate.toISOString(),
        daysToMature: selectedType.daysToMature,
        estimatedHarvestDate: estimatedHarvestDate.toISOString(),
        status: 'optimal',
        zone: targetZone._id // zone رو به صورت خودکار ست کردیم
      };

      console.log('🌱 Saving plant with auto-zone:', {
        plantName: formData.name,
        plantType: formData.type,
        assignedZone: targetZoneName,
        zoneId: targetZone._id
      });

      if (plant) {
        await plantsService.update(plant._id, plantData);
      } else {
        await plantsService.create(plantData);
      }

      onSave(plantData);
    } catch (error) {
      console.error('Error saving plant:', error);
      alert('Error saving plant: ' + error.message);
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
    <div className="fixed h-screen inset-0 backdrop-brightness-50 dark:backdrop-brightness-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            {plant ? 'Edit Plant' : 'Add New Plant'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Plant Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full text-zinc-700 dark:text-zinc-200 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-zinc-700"
            >
              {plantTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} ({type.daysToMature} days to harvest)
                </option>
              ))}
            </select>
          </div>

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
        </form>
      </div>
    </div>
  );
};

export default PlantForm;