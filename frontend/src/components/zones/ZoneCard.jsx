import { Link } from 'react-router-dom';
import { MapPin, Cog, Thermometer, Droplets, Sprout, Sun, Leaf, Gauge, Power } from 'lucide-react';

const ZoneCard = ({ zone }) => {
  const getZoneColor = () => {
    return 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500';
  };

  const getZoneIcon = (plantType) => {
    const plantEmojis = {
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

    return plantEmojis[plantType] || '🌱';
  };

  return (
    <Link 
      to={`/zones/${zone._id}`}
      className={`block p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md dark:hover:shadow-zinc-900 ${getZoneColor()}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getZoneIcon(zone.plantType)}</div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{zone.name}</h3>
            <p className="text-zinc-600 dark:text-gray-400 text-sm">{zone.description}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          zone.status === 'active' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
        }`}>
          {zone.status}
        </span>
      </div>

      {/* آمار سریع - حالا ۳ آیتم */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700">
          <Leaf size={18} className="mx-auto text-green-500 mb-1" />
          <div className="text-lg font-bold text-zinc-900 dark:text-white">
            {/* اولویت با plantCount که از بک‌اند می‌آید، در غیر اینصورت طول آرایه plants */}
            {zone.plantCount ?? (zone.plants?.length || 0)}
          </div>
          <div className="text-xs text-zinc-500 dark:text-gray-400">Plants</div>
        </div>
        <div className="text-center p-3 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700">
          <Power size={18} className="mx-auto text-blue-500 mb-1" />
          <div className="text-lg font-bold text-zinc-900 dark:text-white">
            {zone.deviceCount ?? 0}
          </div>
          <div className="text-xs text-zinc-500 dark:text-gray-400">Devices</div>
        </div>
        <div className="text-center p-3 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700">
          <Gauge size={18} className="mx-auto text-purple-500 mb-1" />
          <div className="text-lg font-bold text-zinc-900 dark:text-white">
            {zone.sensorCount ?? 0}
          </div>
          <div className="text-xs text-zinc-500 dark:text-gray-400">Sensors</div>
        </div>
      </div>

      {/* شرایط محیطی */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-zinc-700 dark:text-gray-300 mb-2">Optimal Conditions:</h4>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Thermometer size={16} className="text-red-500" />
            <span className="text-zinc-600 dark:text-gray-400">Temp:</span>
          </div>
          <span className="font-medium text-zinc-900 dark:text-white">
            {zone.settings?.temperature?.optimal || 0}°C
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Droplets size={16} className="text-blue-500" />
            <span className="text-zinc-600 dark:text-gray-400">Humidity:</span>
          </div>
          <span className="font-medium text-zinc-900 dark:text-white">
            {zone.settings?.humidity?.optimal || 0}%
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Sprout size={16} className="text-green-500" />
            <span className="text-zinc-600 dark:text-gray-400">Soil:</span>
          </div>
          <span className="font-medium text-zinc-900 dark:text-white">
            {zone.settings?.soilMoisture?.optimal || 0}%
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Sun size={16} className="text-yellow-500" />
            <span className="text-zinc-600 dark:text-gray-400">Light:</span>
          </div>
          <span className="font-medium text-zinc-900 dark:text-white">
            {zone.settings?.light?.optimal || 0} lux
          </span>
        </div>
      </div>

      {/* دکمه مشاهده */}
      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-center text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 font-medium text-sm">
          <MapPin size={16} className="mr-1" />
          View Zone Details
        </div>
      </div>
    </Link>
  );
};

export default ZoneCard;
