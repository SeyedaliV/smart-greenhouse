// components/dashboard/SensorAveragesCard.jsx
import { Thermometer, Droplets, Sprout, Sun, RefreshCw } from 'lucide-react';

const SensorAveragesCard = ({ sensorData, lastUpdated, onRefresh }) => {
  const defaultSensorData = {
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
    light: 0
  };

  const data = sensorData || defaultSensorData;

  const getStatusColor = (type, value) => {
    const optimalRanges = {
      temperature: { min: 20, max: 28 },
      humidity: { min: 55, max: 75 },
      soilMoisture: { min: 40, max: 60 },
      light: { min: 600, max: 900 }
    };
    
    const range = optimalRanges[type];
    if (!range) return 'text-zinc-600';
    
    if (value >= range.min && value <= range.max) return 'text-green-600';
    if (value >= range.min - 5 && value <= range.max + 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusText = (type, value) => {
    const optimalRanges = {
      temperature: { min: 20, max: 28 },
      humidity: { min: 55, max: 75 },
      soilMoisture: { min: 40, max: 60 },
      light: { min: 600, max: 900 }
    };
    
    const range = optimalRanges[type];
    if (!range) return 'Unknown';
    
    if (value >= range.min && value <= range.max) return 'Optimal';
    if (value < range.min) return 'Low';
    return 'High';
  };

  const getUnit = (type) => {
    const units = {
      temperature: '°C',
      humidity: '%',
      soilMoisture: '%',
      light: 'lux'
    };
    return units[type] || '';
  };

  const getIcon = (type) => {
    const icons = {
      temperature: <Thermometer size={20} />,
      humidity: <Droplets size={20} />,
      soilMoisture: <Sprout size={20} />,
      light: <Sun size={20} />
    };
    return icons[type];
  };

  const formatLastUpdated = (date) => {
    if (!date) return 'Never';
    const lastUpdate = new Date(date);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastUpdate) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return `${Math.floor(diffMinutes / 60)}h ago`;
  };

  const sensors = [
    { key: 'temperature', label: 'Temperature' },
    { key: 'humidity', label: 'Humidity' },
    { key: 'soilMoisture', label: 'Soil Moisture' },
    { key: 'light', label: 'Light' }
  ];

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Thermometer size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Sensor Averages</h2>
            <p className="text-sm text-zinc-600">Average readings from all zones</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-zinc-500">
            Updated: {formatLastUpdated(lastUpdated)}
          </span>
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="p-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sensors.map(({ key, label }) => {
          const value = data[key] || 0;
          const statusColor = getStatusColor(key, value);
          const statusText = getStatusText(key, value);
          
          return (
            <div key={key} className="bg-zinc-50 rounded-lg p-4 border border-zinc-200 hover:border-zinc-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-white border ${statusColor.replace('text', 'border')}`}>
                  {getIcon(key)}
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor} bg-opacity-10 ${statusColor.replace('text', 'bg')}`}>
                  {statusText}
                </span>
              </div>
              
              <div className="text-2xl font-bold text-zinc-900 mb-1">
                {value} {getUnit(key)}
              </div>
              
              <div className="text-sm text-zinc-600">
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SensorAveragesCard;