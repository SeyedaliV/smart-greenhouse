import { useState } from 'react';
import { devicesService } from '../../services/api';

const DeviceForm = ({ onClose, onSave, zones, preSelectedZone }) => {
  const [formData, setFormData] = useState({
    type: 'waterPump',
    zone: preSelectedZone ? preSelectedZone.name : '',
    powerConsumption: ''
  });

  const deviceTypeOptions = [
    { value: 'waterPump', label: 'Water Pump' },
    { value: 'fan', label: 'Ventilation Fan' },
    { value: 'light', label: 'Grow Light' },
    { value: 'heater', label: 'Heater' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const deviceData = {
        type: formData.type,
        zone: formData.zone,
        powerConsumption: formData.powerConsumption ? parseInt(formData.powerConsumption) : undefined
      };

      const response = await devicesService.create(deviceData);

      console.log('✅ Device created:', response.data.device);
      onSave(response.data.device);
    } catch (error) {
      console.error('❌ Error creating device:', error);
      alert('Error creating device: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const selectedType = deviceTypeOptions.find(type => type.value === formData.type);

  return (
    <div className="fixed h-screen inset-0 backdrop-brightness-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Add New Device
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Device Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full text-zinc-700 dark:text-zinc-200 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-zinc-700"
            >
              {deviceTypeOptions.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Zone
            </label>
            {preSelectedZone ? (
              // Show selected zone as read-only when pre-selected
              <div className="w-full text-zinc-700 dark:text-zinc-200 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-700">
                {preSelectedZone.name}
              </div>
            ) : (
              // Show dropdown when zones are available
              <select
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                className="w-full text-zinc-700 dark:text-zinc-200 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-zinc-700"
                required
              >
                <option value="">Select a zone</option>
                {zones && zones.map(zone => (
                  <option key={zone._id} value={zone.name}>
                    {zone.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Power Consumption (W)
            </label>
            <input
              type="number"
              name="powerConsumption"
              value={formData.powerConsumption}
              onChange={handleChange}
              className="w-full text-zinc-700 dark:text-zinc-200 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-zinc-700"
              placeholder="Enter power consumption"
            />
          </div>

          {selectedType && formData.zone && (
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Device Information</h4>
              <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <div>• Type: {selectedType.label}</div>
                <div>• Zone: {formData.zone}</div>
                <div>• A unique device code will be auto-generated</div>
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
              Add Device
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeviceForm;
