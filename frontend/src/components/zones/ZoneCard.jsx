import { Link } from 'react-router-dom';
import { MapPin, Cog, Thermometer, Droplets, Sprout, Sun, Leaf, Gauge } from 'lucide-react';

const ZoneCard = ({ zone }) => {
  const getZoneColor = (zoneName) => {
    switch (zoneName) {
      case 'Zone A': return 'border-red-200 hover:border-red-400';
      case 'Zone B': return 'border-green-200 hover:border-green-400';
      case 'Zone C': return 'border-blue-200 hover:border-blue-400';
      case 'Zone D': return 'border-purple-200 hover:border-purple-400';
      default: return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const getZoneIcon = (zoneName) => {
    switch (zoneName) {
      case 'Zone A': return '🍅'; // Tomato
      case 'Zone B': return '🥒'; // Cucumber
      case 'Zone C': return '🥬'; // Lettuce
      case 'Zone D': return '🫑'; // Bell Pepper
      default: return '🌱';
    }
  };

  return (
    <Link 
      to={`/zones/${zone._id}`}
      className={`block p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${getZoneColor(zone.name)}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getZoneIcon(zone.name)}</div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{zone.name}</h3>
            <p className="text-gray-600 text-sm">{zone.description}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          zone.status === 'active' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
        }`}>
          {zone.status}
        </span>
      </div>

      {/* آمار سریع - حالا ۳ آیتم */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
          <Leaf size={18} className="mx-auto text-green-500 mb-1" />
          <div className="text-lg font-bold text-gray-900">{zone.plants?.length || 0}</div>
          <div className="text-xs text-gray-500">Plants</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
          <Cog size={18} className="mx-auto text-blue-500 mb-1" />
          <div className="text-lg font-bold text-gray-900">4</div>
          <div className="text-xs text-gray-500">Devices</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
          <Gauge size={18} className="mx-auto text-purple-500 mb-1" />
          <div className="text-lg font-bold text-gray-900">4</div>
          <div className="text-xs text-gray-500">Sensors</div>
        </div>
      </div>

      {/* شرایط محیطی */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Optimal Conditions:</h4>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Thermometer size={16} className="text-red-500" />
            <span className="text-gray-600">Temp:</span>
          </div>
          <span className="font-medium text-gray-900">
            {zone.settings?.temperature?.optimal || 0}°C
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Droplets size={16} className="text-blue-500" />
            <span className="text-gray-600">Humidity:</span>
          </div>
          <span className="font-medium text-gray-900">
            {zone.settings?.humidity?.optimal || 0}%
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Sprout size={16} className="text-green-500" />
            <span className="text-gray-600">Soil:</span>
          </div>
          <span className="font-medium text-gray-900">
            {zone.settings?.soilMoisture?.optimal || 0}%
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Sun size={16} className="text-yellow-500" />
            <span className="text-gray-600">Light:</span>
          </div>
          <span className="font-medium text-gray-900">
            {zone.settings?.light?.optimal || 0} lux
          </span>
        </div>
      </div>

      {/* دکمه مشاهده */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center text-green-600 hover:text-green-700 font-medium text-sm">
          <MapPin size={16} className="mr-1" />
          View Zone Details
        </div>
      </div>
    </Link>
  );
};

export default ZoneCard;