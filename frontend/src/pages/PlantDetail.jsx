import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { plantsService, zonesService } from '../services/api';
import { Thermometer, Droplets, Sprout, Sun, Calendar, Clock, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { getPlantStatus } from '../utils/plantCalculations';
import Loading from '../components/common/Loading';
import GoBackBtn from '../components/common/GoBackBtn';
import PlantForm from '../components/plants/PlantForm';
import PlantDeleteModal from '../components/plants/PlantDeleteModal';

const PlantDetail = () => {
  const { plantId } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchZones();
    if (plantId) {
      fetchPlantDetail();
    }
  }, [plantId]);

  const fetchZones = async () => {
    try {
      const zonesData = await zonesService.getAll();
      setZones(zonesData);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

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

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await plantsService.delete(plantId);
      navigate('/plants');
    } catch (error) {
      console.error('Error deleting plant:', error);
      alert('Error deleting plant: ' + (error.response?.data?.message || error.message));
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    fetchPlantDetail(); // Refresh data after edit
  };

  if (loading) {
    return (
      <Loading />
    );
  }

  if (!plant) {
    return (
      <div className="text-center py-12">
        <div className="text-zinc-400 text-6xl mb-4">🌱</div>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">Plant not found</h3>
        <Link to="/plants" className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300">
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
          <GoBackBtn />
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{plant.name}</h1>
            <p className="text-zinc-600 dark:text-gray-400 capitalize">{plant.type} • Plant Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-4 py-2 rounded-full text-sm font-medium border ${
            plant.status === 'optimal' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800' :
            plant.status === 'needs_attention' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' :
            'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
          }`}>
            {plant.status.replace('_', ' ')}
          </span>
          <button
            onClick={handleEdit}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
          >
            <Edit size={16} />
            <span>Edit Plant</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 font-medium"
          >
            <Trash2 size={16} />
            <span>Delete Plant</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* سایدبار اطلاعات */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Plant Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-gray-400">Name:</span>
                <span className="font-medium text-zinc-900 dark:text-white">{plant.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-gray-400">Type:</span>
                <span className="font-medium text-zinc-900 dark:text-white capitalize">{plant.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-gray-400">Zone:</span>
                <span className="font-medium text-zinc-900 dark:text-white">{plant.zone?.name || 'No Zone'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-gray-400">Planted:</span>
                <span className="font-medium text-zinc-900 dark:text-white">
                  {new Date(plant.plantingDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-gray-400">Days to Mature:</span>
                <span className="font-medium text-zinc-900 dark:text-white">{plant.daysToMature || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* وضعیت برداشت */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Harvest Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock size={18} className="text-blue-500" />
                  <span className="text-zinc-600 dark:text-gray-400">Time to Harvest:</span>
                </div>
                <span className={`font-medium text-lg ${plantStatus.harvestStatus.color}`}>
                  {plantStatus.harvestStatus.text}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar size={18} className="text-green-500" />
                  <span className="text-zinc-600 dark:text-gray-400">Estimated Harvest:</span>
                </div>
                <span className="font-medium text-zinc-900 dark:text-white">
                  {plantStatus.harvestDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* محتوای اصلی */}
        <div className="lg:col-span-2 space-y-6">
          {/* وضعیت فعلی */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Current Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Thermometer size={24} className="text-red-500" />
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-white">Temperature</div>
                    <div className="text-sm text-zinc-500 dark:text-gray-400">Current</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-zinc-900 dark:text-white">
                    {plant.currentStats?.temperature || 0}°C
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-gray-400">
                    Optimal: {plant.optimalConditions?.temperature?.min || 0}°C - {plant.optimalConditions?.temperature?.max || 0}°C
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Droplets size={24} className="text-blue-500" />
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-white">Air Humidity</div>
                    <div className="text-sm text-zinc-500 dark:text-gray-400">Current</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-zinc-900 dark:text-white">
                    {plant.currentStats?.humidity || 0}%
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-gray-400">
                    Optimal: {plant.optimalConditions?.humidity?.min || 0}% - {plant.optimalConditions?.humidity?.max || 0}%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Sprout size={24} className="text-green-500" />
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-white">Soil Moisture</div>
                    <div className="text-sm text-zinc-500 dark:text-gray-400">Current</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-zinc-900 dark:text-white">
                    {plant.currentStats?.soilMoisture || 0}%
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-gray-400">
                    Optimal: {plant.optimalConditions?.soilMoisture?.min || 0}% - {plant.optimalConditions?.soilMoisture?.max || 0}%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Sun size={24} className="text-yellow-500" />
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-white">Light</div>
                    <div className="text-sm text-zinc-500 dark:text-gray-400">Current</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-zinc-900 dark:text-white">
                    {plant.currentStats?.light || 0} lux
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-gray-400">
                    Optimal: {plant.optimalConditions?.light?.min || 0} - {plant.optimalConditions?.light?.max || 0} lux
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* اطلاعات رشد */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Growth Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-zinc-700 dark:text-gray-300 mb-2">Optimal Conditions</h4>
                <div className="text-sm text-zinc-600 dark:text-gray-400 space-y-1">
                  <div>• Temperature: {plant.optimalConditions?.temperature?.min || 0}°C - {plant.optimalConditions?.temperature?.max || 0}°C</div>
                  <div>• Air Humidity: {plant.optimalConditions?.humidity?.min || 0}% - {plant.optimalConditions?.humidity?.max || 0}%</div>
                  <div>• Soil Moisture: {plant.optimalConditions?.soilMoisture?.min || 0}% - {plant.optimalConditions?.soilMoisture?.max || 0}%</div>
                  <div>• Light: {plant.optimalConditions?.light?.min || 0} - {plant.optimalConditions?.light?.max || 0} lux</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-zinc-700 dark:text-gray-300 mb-2">Growth Timeline</h4>
                <div className="text-sm text-zinc-600 dark:text-gray-400 space-y-1">
                  <div>• Planting Date: {new Date(plant.plantingDate).toLocaleDateString()}</div>
                  <div>• Days to Mature: {plant.daysToMature || 'N/A'}</div>
                  <div>• Estimated Harvest: {plantStatus.harvestDate}</div>
                  <div>• Plant ID: <code className="text-xs bg-zinc-100 dark:bg-zinc-700 px-1 rounded">{plant._id || plant.id}</code></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Plant Modal */}
      {showEditModal && (
        <PlantForm
          plant={plant}
          zones={zones}
          onClose={handleEditClose}
          onSave={handleEditClose}
        />
      )}

      {/* Delete Plant Modal */}
      {showDeleteModal && (
        <PlantDeleteModal
          plant={plant}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default PlantDetail;
