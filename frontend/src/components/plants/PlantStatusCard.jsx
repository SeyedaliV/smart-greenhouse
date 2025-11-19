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
      case 'optimal': return 'bg-green-100 text-green-800';
      case 'needs_attention': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHarvestColor = (daysLeft) => {
    if (daysLeft <= 0) return 'text-green-600 bg-green-50 border-green-200';
    if (daysLeft <= 7) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (daysLeft <= 30) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getHarvestText = (daysLeft) => {
    if (daysLeft <= 0) return 'Ready for Harvest!';
    if (daysLeft <= 7) return `${daysLeft} days`;
    return `${daysLeft} days`;
  };

  const getConditionIcon = (stat, optimalMin, optimalMax) => {
    if (!stat) return <AlertTriangle size={12} className="text-gray-400" />;
    if (stat >= optimalMin && stat <= optimalMax) return <CheckCircle size={12} className="text-green-500" />;
    if (stat < optimalMin) return <AlertTriangle size={12} className="text-yellow-500" />;
    return <AlertTriangle size={12} className="text-red-500" />;
  };

  return (
    <Link to={`/plants/${plant._id || plant.id}`} className="block group">
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 group-hover:border-green-300 group-hover:translate-y-[-2px] h-full">
        {/* هدر کارت */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            {/* <div className="shrink-0 h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center transition-colors">
              <Leaf size={20} className="text-green-600" />
            </div> */}
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                {plant.name}
              </h3>
              <p className="text-sm text-gray-600 capitalize">{plant.type}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plant.status)}`}>
            {plant.status.replace('_', ' ')}
          </span>
        </div>

        {/* آمار فعلی - با humidity */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-2">
              <Thermometer size={16} className="text-red-500" />
              Temp:
            </span>
            <div className="flex items-center space-x-1">
              <span className="font-medium text-zinc-700">{plant.currentStats?.temperature || 0}°C</span>
              {getConditionIcon(
                plant.currentStats?.temperature,
                plant.optimalConditions?.temperature?.min,
                plant.optimalConditions?.temperature?.max
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-2">
              <Droplets size={16} className="text-blue-400" />
              Air:
            </span>
            <div className="flex items-center space-x-1">
              <span className="font-medium text-zinc-700">{plant.currentStats?.humidity || 0}%</span>
              {getConditionIcon(
                plant.currentStats?.humidity,
                plant.optimalConditions?.humidity?.min,
                plant.optimalConditions?.humidity?.max
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-2">
              <Sprout size={16} className="text-green-500" />
              Soil:
            </span>
            <div className="flex items-center space-x-1">
              <span className="font-medium text-zinc-700">{plant.currentStats?.soilMoisture || 0}%</span>
              {getConditionIcon(
                plant.currentStats?.soilMoisture,
                plant.optimalConditions?.soilMoisture?.min,
                plant.optimalConditions?.soilMoisture?.max
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-2">
              <Sun size={16} className="text-yellow-500" />
              Light:
            </span>
            <div className="flex items-center space-x-1">
              <span className="font-medium text-zinc-700">{plant.currentStats?.light || 0} lux</span>
              {getConditionIcon(
                plant.currentStats?.light,
                plant.optimalConditions?.light?.min,
                plant.optimalConditions?.light?.max
              )}
            </div>
          </div>
        </div>

        {/* وضعیت برداشت */}
        <div className={`mt-4 pt-3 border-t ${getHarvestColor(plant.daysUntilHarvest)} border rounded-lg p-2`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Clock size={16} className="text-gray-500 mb-px mr-2" />
              <span className="text-xs font-medium">Harvest:</span>
            </div>
            <span className={`text-sm font-semibold ${
              getHarvestColor(plant.daysUntilHarvest).includes('text-green') ? 'text-green-700' : 
              getHarvestColor(plant.daysUntilHarvest).includes('text-yellow') ? 'text-yellow-700' :
              getHarvestColor(plant.daysUntilHarvest).includes('text-blue') ? 'text-blue-700' : 'text-gray-700'
            }`}>
              {getHarvestText(plant.daysUntilHarvest)}
            </span>
          </div>
          
          {/* نوار پیشرفت برداشت */}
          {plant.daysUntilHarvest > 0 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.max(0, Math.min(100, ((plant.daysToMature - plant.daysUntilHarvest) / plant.daysToMature) * 100))}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* دکمه مشاهده جزئیات */}
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="text-center">
            <span className="text-green-600 text-xs font-medium group-hover:text-green-700 transition-colors">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PlantStatusCard;