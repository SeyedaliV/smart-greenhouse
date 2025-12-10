import { Fan, Flame, Lightbulb, Waves } from 'lucide-react';
import { useState } from 'react';

const DeviceCard = ({ device, onControl, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const deviceIcons = {
    waterPump: <div className='size-14 p-2 rounded-lg flex justify-center items-center bg-blue-50 dark:bg-blue-900/20'>
    <Waves size={36} className='text-blue-500' /></div>,
    fan: <div className='size-14 p-2 rounded-lg flex justify-center items-center bg-zinc-50 dark:bg-zinc-800'>
    <Fan size={36} className='text-zinc-500' /></div>,
    light: <div className='size-14 p-2 rounded-lg flex justify-center items-center bg-yellow-50 dark:bg-yellow-900/20'>
    <Lightbulb size={36} className='text-yellow-500' /></div>,
    heater: <div className='size-14 p-2 rounded-lg flex justify-center items-center bg-red-50 dark:bg-red-900/20'>
    <Flame size={36} className='text-red-500' /></div>
  };

  const deviceNames = {
    waterPump: 'Water Pump',
    fan: 'Ventilation Fans', 
    light: 'Grow Lights',
    heater: 'Heater'
  };

  const handleStatusChange = async (newStatus) => {
    setIsLoading(true);
    try {
      console.log('🎮 Changing device status:', device.name, '→', newStatus);
      console.log('🆔 Device ID:', device.id || device._id);
      await onControl(device.id || device._id, newStatus);
    } catch (error) {
      console.error('❌ Error in DeviceCard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ON': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'OFF': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'AUTO': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      default: return 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800';
    }
  };

  const getLastActionTime = () => {
    if (!device.lastAction) return 'Never';
    
    const lastAction = new Date(device.lastAction);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastAction) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return lastAction.toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 hover:shadow-md dark:hover:shadow-zinc-900 transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="text-3xl mr-4">
            {deviceIcons[device.type] || '⚙️'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {deviceNames[device.type] || device.name}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-gray-400 capitalize">
              {device.type.replace(/([A-Z])/g, ' $1').trim()}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(device.status)}`}>
          {device.status}
        </span>
      </div>

      {/* اطلاعات دستگاه */}
      <div className="space-y-3 mb-6">
        {/* Zone Information */}
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600 dark:text-gray-400">Zone:</span>
          <span className="font-medium text-zinc-700 dark:text-gray-300">{device.zone?.name || device.zone || 'Not assigned'}</span>
        </div>
        
        {device.powerConsumption && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-600 dark:text-gray-400">Power Consumption:</span>
            <span className="font-medium text-zinc-700 dark:text-gray-300">{device.powerConsumption}W</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600 dark:text-gray-400">Last Action:</span>
          <span className="font-medium text-zinc-700 dark:text-gray-300">{getLastActionTime()}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600 dark:text-gray-400">Device Code:</span>
          <span className="font-medium text-zinc-700 dark:text-gray-300">{device.specificCode}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-zinc-600 dark:text-gray-400">Device DB ID:</span>
          <span className="font-medium text-zinc-700 dark:text-gray-300">{device.id || device._id}</span>
        </div>
      </div>

      {/* کنترل‌ها */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-700 dark:text-gray-300 mb-2">
          Control Device:
        </label>
        <div className="grid grid-cols-4 gap-2">
          {['ON', 'OFF', 'AUTO'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={isLoading || device.status === status}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                device.status === status
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-gray-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
              } ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {status}
            </button>
          ))}
           <button
            onClick={() => onDelete(device.id || device._id)}
            className="px-3 py-2 rounded-lg text-sm font-medium transition duration-200 w-full bg-red-500 text-white hover:bg-red-600"
          >
            Delete Device
          </button>
        </div>
      </div>

      {/* وضعیت بارگذاری */}
      {isLoading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
          <span className="ml-2 text-sm text-zinc-600 dark:text-gray-400">Updating...</span>
        </div>
      )}
    </div>
  );
};

export default DeviceCard;
