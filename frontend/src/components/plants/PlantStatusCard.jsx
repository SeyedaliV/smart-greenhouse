import { Link } from 'react-router-dom';
import { 
  Thermometer, 
  Droplets, 
  Sprout, 
  Sun,
  CheckCircle,
  AlertTriangle,
  Clock,
  Leaf
} from 'lucide-react';

const PlantStatusCard = ({ plant }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'needs_attention': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'critical': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default: return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300';
    }
  };

  const getHarvestColor = (daysLeft) => {
    if (daysLeft <= 0) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (daysLeft <= 7) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    if (daysLeft <= 30) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    return 'text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700';
  };

  const getHarvestText = (daysLeft) => {
    if (daysLeft <= 0) return 'Ready for Harvest!';
    if (daysLeft <= 7) return `${daysLeft} days`;
    return `${daysLeft} days`;
  };

  const getConditionIcon = (stat, optimalMin, optimalMax) => {
    if (!stat) return <AlertTriangle size={12} className="text-zinc-400 dark:text-zinc-500" />;
    if (stat >= optimalMin && stat <= optimalMax) return <CheckCircle size={12} className="text-green-500 dark:text-green-400" />;
    if (stat < optimalMin) return <AlertTriangle size={12} className="text-yellow-500 dark:text-yellow-400" />;
    return <AlertTriangle size={12} className="text-red-500 dark:text-red-400" />;
  };

  return (
    <Link to={`/plants/${plant._id || plant.id}`} className="block group">
      <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg p-4 transition-all duration-200 group-hover:border-green-300 dark:group-hover:border-green-600 h-full">
        {/* هدر کارت */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-500 transition-colors">
                {plant.name}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">{plant.type}</p>
            </div>
          </div>
          <span className={`px-2 py-1 text-nowrap rounded-full text-xs font-medium ${getStatusColor(plant.status)}`}>
            {plant.status.replace('_', ' ')}
          </span>
        </div>

        {/* آمار فعلی - با humidity */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between items-center">
            <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
              <Thermometer size={16} className="text-red-500" />
              Temp:
            </span>
            <div className="flex items-center space-x-1">
              <span className="font-medium text-zinc-700 dark:text-zinc-200">{plant.currentStats?.temperature || 0}°C</span>
              {getConditionIcon(
                plant.currentStats?.temperature,
                plant.optimalConditions?.temperature?.min,
                plant.optimalConditions?.temperature?.max
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
              <Droplets size={16} className="text-blue-400" />
              Air:
            </span>
            <div className="flex items-center space-x-1">
              <span className="font-medium text-zinc-700 dark:text-zinc-200">{plant.currentStats?.humidity || 0}%</span>
              {getConditionIcon(
                plant.currentStats?.humidity,
                plant.optimalConditions?.humidity?.min,
                plant.optimalConditions?.humidity?.max
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
              <Sprout size={16} className="text-green-500" />
              Soil:
            </span>
            <div className="flex items-center space-x-1">
              <span className="font-medium text-zinc-700 dark:text-zinc-200">{plant.currentStats?.soilMoisture || 0}%</span>
              {getConditionIcon(
                plant.currentStats?.soilMoisture,
                plant.optimalConditions?.soilMoisture?.min,
                plant.optimalConditions?.soilMoisture?.max
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
              <Sun size={16} className="text-yellow-500" />
              Light:
            </span>
            <div className="flex items-center space-x-1">
              <span className="font-medium text-zinc-700 dark:text-zinc-200">{plant.currentStats?.light || 0} lux</span>
              {getConditionIcon(
                plant.currentStats?.light,
                plant.optimalConditions?.light?.min,
                plant.optimalConditions?.light?.max
              )}
            </div>
          </div>
        </div>

        {/* وضعیت برداشت */}
        <div className={`mt-4 pt-3 border-t ${getHarvestColor(plant.daysUntilHarvest)} border rounded-lg p-2 dark:border-zinc-600`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Clock size={16} className="text-zinc-500 dark:text-zinc-400 mb-px mr-2" />
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Harvest:</span>
            </div>
            <span className={`text-sm font-semibold ${
              getHarvestColor(plant.daysUntilHarvest).includes('text-green') ? 'text-green-700 dark:text-green-400' : 
              getHarvestColor(plant.daysUntilHarvest).includes('text-yellow') ? 'text-yellow-700 dark:text-yellow-400' :
              getHarvestColor(plant.daysUntilHarvest).includes('text-blue') ? 'text-blue-700 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-300'
            }`}>
              {getHarvestText(plant.daysUntilHarvest)}
            </span>
          </div>
          
          {/* نوار پیشرفت برداشت */}
          {plant.daysUntilHarvest > 0 && (
            <div className="mt-2">
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5">
                <div 
                  className="bg-green-500 dark:bg-green-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.max(0, Math.min(100, ((plant.daysToMature - plant.daysUntilHarvest) / plant.daysToMature) * 100))}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* دکمه مشاهده جزئیات */}
        <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-700">
          <div className="text-center">
            <span className="text-green-600 dark:text-green-500 text-xs font-medium group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PlantStatusCard;