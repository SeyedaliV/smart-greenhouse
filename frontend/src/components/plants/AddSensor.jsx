import React, { useState, useEffect } from 'react';
import { X, Thermometer, Droplets, Sprout, Sun, Cpu, Globe } from 'lucide-react';
import { sensorsService } from '../../services/api';

const AddSensor = ({
  zone,
  plant,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    type: 'temperature',
    hardwareId: '',
    ipAddress: '',
    location: '',
    samplingIntervalSeconds: 60
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isPlantFixed = !!plant;

  useEffect(() => {
    if (isPlantFixed && plant?._id) {
      console.log('🌱 Fixed plant for sensor:', plant.name);
    }
  }, [isPlantFixed, plant]);

  const generateRandomMAC = () => {
    const hex = '0123456789ABCDEF';
    let mac = '';
    for (let i = 0; i < 6; i++) {
      mac += hex[Math.floor(Math.random() * 16)] + hex[Math.floor(Math.random() * 16)];
      if (i < 5) mac += ':';
    }
    return mac;
  };

  const generateRandomIP = () => {
    return `192.168.1.${Math.floor(Math.random() * 100) + 100}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleGenerateMAC = () => {
    setFormData(prev => ({ ...prev, hardwareId: generateRandomMAC() }));
  };

  const handleGenerateIP = () => {
    setFormData(prev => ({ ...prev, ipAddress: generateRandomIP() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!zone?._id) {
        throw new Error('Zone information is missing');
      }

      const sensorData = {
        type: formData.type,
        zone: zone._id,
        plant: isPlantFixed ? plant._id : null,
        hardwareId: formData.hardwareId || undefined,
        ipAddress: formData.ipAddress || undefined,
        location: formData.location || undefined,
        samplingIntervalSeconds: Number(formData.samplingIntervalSeconds) || undefined
      };

      console.log('📦 Sending sensor data:', sensorData);

      const response = await sensorsService.create(sensorData);
      
      if (response.status === 'success') {
        onSuccess?.(response.data.sensor);
        onClose();
      } else {
        throw new Error(response.message || 'Failed to create sensor');
      }
    } catch (err) {
      console.error('Error creating sensor:', err);
      setError(err.message || 'Failed to create sensor');
    } finally {
      setLoading(false);
    }
  };

  const getSensorIcon = (type) => {
    switch (type) {
      case 'temperature': return <Thermometer className="text-red-500" size={24} />;
      case 'humidity': return <Droplets className="text-blue-500" size={24} />;
      case 'soilMoisture': return <Sprout className="text-green-500" size={24} />;
      case 'light': return <Sun className="text-yellow-500" size={24} />;
      default: return null;
    }
  };

  const getSensorDescription = (type) => {
    const descriptions = {
      temperature: 'Environment temperature',
      humidity: 'Air humidity level',
      soilMoisture: 'Soil moisture content',
      light: 'Light intensity'
    };
    return descriptions[type] || '';
  };

  return (
    <div className="fixed inset-0 backdrop-brightness-50 dark:backdrop-brightness-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-xl w-full max-w-4xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Add New Sensor
              {isPlantFixed && (
                <span className="text-sm font-normal text-zinc-600 dark:text-zinc-400 ml-2">
                  for {plant?.name}
                </span>
              )}
            </h2>
            {zone?.name && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Zone: {zone.name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Sensor Type and Basic Info */}
            <div className="space-y-6">
              {/* Sensor Type Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  Sensor Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['temperature', 'humidity', 'soilMoisture', 'light'].map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setFormData(prev => ({ ...prev, type }))}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                        formData.type === type
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500'
                      }`}
                    >
                      {getSensorIcon(type)}
                      <span className="mt-2 text-sm font-medium text-zinc-900 dark:text-white capitalize">
                        {type === 'soilMoisture' ? 'Soil Moisture' : type}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 text-center">
                        {getSensorDescription(type)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {isPlantFixed && plant && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <Sprout className="text-green-600 dark:text-green-400 mr-3" size={20} />
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white">Plant Associated</h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        This sensor will be automatically linked to <strong>{plant.name}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Configuration Details */}
            <div className="space-y-6">
              {/* Hardware ID (MAC Address) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Hardware ID (MAC Address)
                  </label>
                  <button 
                    type="button" 
                    onClick={handleGenerateMAC}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                  >
                    <Cpu size={12} className="mr-1" />
                    Generate Random
                  </button>
                </div>
                <input
                  type="text"
                  name="hardwareId"
                  value={formData.hardwareId}
                  onChange={handleInputChange}
                  placeholder="00:1A:2B:3C:4D:5E"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Unique device identifier in the network
                </p>
              </div>

              {/* IP Address */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    IP Address
                  </label>
                  <button 
                    type="button" 
                    onClick={handleGenerateIP}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                  >
                    <Globe size={12} className="mr-1" />
                    Generate Random
                  </button>
                </div>
                <input
                  type="text"
                  name="ipAddress"
                  value={formData.ipAddress}
                  onChange={handleInputChange}
                  placeholder="192.168.1.100"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Local network IP address for communication
                </p>
              </div>

              {/* Physical Location */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Physical Location (in this zone)
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Bed 3, row 1"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Helps staff find the exact sensor in the greenhouse
                </p>
              </div>

              {/* Sampling Interval */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Reporting Interval (seconds)
                </label>
                <input
                  type="number"
                  min="5"
                  max="3600"
                  name="samplingIntervalSeconds"
                  value={formData.samplingIntervalSeconds}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  How often sensor sends data (5–3600 seconds)
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons - Full width bottom section */}
          <div className="flex space-x-3 pt-6 mt-6 border-t border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition duration-200 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center transition duration-200"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Add Sensor'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSensor;