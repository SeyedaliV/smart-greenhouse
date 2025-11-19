import { Droplet, Flame, Spotlight, Wind } from 'lucide-react';
import { useState } from 'react';

const DeviceCard = ({ device, onControl }) => {
  const [isLoading, setIsLoading] = useState(false);

  const deviceIcons = {
    waterPump: <div className='size-14 p-2 rounded-lg flex justify-center items-center bg-blue-50'>
    <Droplet size={36} className='text-blue-500' /></div>,
    fan: <div className='size-14 p-2 rounded-lg flex justify-center items-center bg-cyan-50'>
    <Wind size={36} className='text-cyan-500' /></div>,
    light: <div className='size-14 p-2 rounded-lg flex justify-center items-center bg-yellow-50'>
    <Spotlight size={36} className='text-yellow-500' /></div>,
    heater: <div className='size-14 p-2 rounded-lg flex justify-center items-center bg-orange-50'>
    <Flame size={36} className='text-orange-500' /></div>
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
      case 'ON': return 'text-green-600 bg-green-100';
      case 'OFF': return 'text-red-600 bg-red-100';
      case 'AUTO': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
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
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="text-3xl mr-4">
            {deviceIcons[device.type] || '⚙️'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {deviceNames[device.type] || device.name}
            </h3>
            <p className="text-sm text-gray-600 capitalize">
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
          <span className="text-gray-600">Zone:</span>
          <span className="font-medium text-zinc-700">{device.zone || 'Not assigned'}</span>
        </div>
        
        {device.powerConsumption && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Power Consumption:</span>
            <span className="font-medium text-zinc-700">{device.powerConsumption}W</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Last Action:</span>
          <span className="font-medium text-zinc-700">{getLastActionTime()}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Device ID:</span>
          <span className="font-medium text-zinc-700">{device.id || device._id}</span>
        </div>
      </div>

      {/* کنترل‌ها */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Control Device:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['ON', 'OFF', 'AUTO'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={isLoading || device.status === status}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                device.status === status
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* وضعیت بارگذاری */}
      {isLoading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
          <span className="ml-2 text-sm text-gray-600">Updating...</span>
        </div>
      )}
    </div>
  );
};

export default DeviceCard;