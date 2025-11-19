import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { plantsService } from '../services/api';
import { Thermometer, Droplets, Sprout, Sun, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { getPlantStatus } from '../utils/plantCalculations';
import Loading from '../components/common/Loading';

const PlantDetail = () => {
  const { plantId } = useParams();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (plantId) {
      fetchPlantDetail();
    }
  }, [plantId]);

  const fetchPlantDetail = async () => {
    try {
      const plantData = await plantsService.getOne(plantId);
      setPlant(plantData.data?.plant || plantData);
    } catch (error) {
      console.error('Error fetching plant details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Loading />
    );
  }

  if (!plant) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🌱</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Plant not found</h3>
        <Link to="/plants" className="text-green-500 hover:text-green-600">
          ← Back to Plants
        </Link>
      </div>
    );
  }

  const plantStatus = getPlantStatus(plant);

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/plants" className="text-green-500 hover:text-green-600 flex items-center">
            <ArrowLeft size={20} className="mr-2" />
            Back to Plants
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{plant.name}</h1>
            <p className="text-gray-600 capitalize">{plant.type} • Plant Details</p>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium border ${
          plant.status === 'optimal' ? 'bg-green-100 text-green-800 border-green-200' :
          plant.status === 'needs_attention' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
          'bg-red-100 text-red-800 border-red-200'
        }`}>
          {plant.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* سایدبار اطلاعات */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plant Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{plant.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium text-gray-900 capitalize">{plant.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Zone:</span>
                <span className="font-medium text-gray-900">{plant.zone?.name || 'No Zone'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Planted:</span>
                <span className="font-medium text-gray-900">
                  {new Date(plant.plantingDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Days to Mature:</span>
                <span className="font-medium text-gray-900">{plant.daysToMature || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* وضعیت برداشت */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Harvest Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock size={18} className="text-blue-500" />
                  <span className="text-gray-600">Time to Harvest:</span>
                </div>
                <span className={`font-medium text-lg ${plantStatus.harvestStatus.color}`}>
                  {plantStatus.harvestStatus.text}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar size={18} className="text-green-500" />
                  <span className="text-gray-600">Estimated Harvest:</span>
                </div>
                <span className="font-medium text-gray-900">
                  {plantStatus.harvestDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* محتوای اصلی */}
        <div className="lg:col-span-2 space-y-6">
          {/* وضعیت فعلی */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Thermometer size={24} className="text-red-500" />
                  <div>
                    <div className="font-medium text-gray-900">Temperature</div>
                    <div className="text-sm text-gray-500">Current</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    {plant.currentStats?.temperature || 0}°C
                  </div>
                  <div className="text-sm text-gray-500">
                    Optimal: {plant.optimalConditions?.temperature?.min || 0}°C - {plant.optimalConditions?.temperature?.max || 0}°C
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Droplets size={24} className="text-blue-500" />
                  <div>
                    <div className="font-medium text-gray-900">Air Humidity</div>
                    <div className="text-sm text-gray-500">Current</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    {plant.currentStats?.humidity || 0}%
                  </div>
                  <div className="text-sm text-gray-500">
                    Optimal: {plant.optimalConditions?.humidity?.min || 0}% - {plant.optimalConditions?.humidity?.max || 0}%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Sprout size={24} className="text-green-500" />
                  <div>
                    <div className="font-medium text-gray-900">Soil Moisture</div>
                    <div className="text-sm text-gray-500">Current</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    {plant.currentStats?.soilMoisture || 0}%
                  </div>
                  <div className="text-sm text-gray-500">
                    Optimal: {plant.optimalConditions?.soilMoisture?.min || 0}% - {plant.optimalConditions?.soilMoisture?.max || 0}%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Sun size={24} className="text-yellow-500" />
                  <div>
                    <div className="font-medium text-gray-900">Light</div>
                    <div className="text-sm text-gray-500">Current</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    {plant.currentStats?.light || 0} lux
                  </div>
                  <div className="text-sm text-gray-500">
                    Optimal: {plant.optimalConditions?.light?.min || 0} - {plant.optimalConditions?.light?.max || 0} lux
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* اطلاعات رشد */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Optimal Conditions</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• Temperature: {plant.optimalConditions?.temperature?.min || 0}°C - {plant.optimalConditions?.temperature?.max || 0}°C</div>
                  <div>• Air Humidity: {plant.optimalConditions?.humidity?.min || 0}% - {plant.optimalConditions?.humidity?.max || 0}%</div>
                  <div>• Soil Moisture: {plant.optimalConditions?.soilMoisture?.min || 0}% - {plant.optimalConditions?.soilMoisture?.max || 0}%</div>
                  <div>• Light: {plant.optimalConditions?.light?.min || 0} - {plant.optimalConditions?.light?.max || 0} lux</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Growth Timeline</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• Planting Date: {new Date(plant.plantingDate).toLocaleDateString()}</div>
                  <div>• Days to Mature: {plant.daysToMature || 'N/A'}</div>
                  <div>• Estimated Harvest: {plantStatus.harvestDate}</div>
                  <div>• Plant ID: <code className="text-xs bg-gray-100 px-1 rounded">{plant._id || plant.id}</code></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDetail;