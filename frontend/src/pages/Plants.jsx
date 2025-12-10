import { useState, useEffect } from 'react';
import PlantTable from '../components/plants/PlantTable';
import PlantForm from '../components/plants/PlantForm';
import PlantDeleteModal from '../components/plants/PlantDeleteModal';
import { plantsService, zonesService } from '../services/api';
import { Filter } from 'lucide-react';
import { getPlantStatus } from '../utils/plantCalculations';
import Loading from '../components/common/Loading';

const Plants = () => {
  const [plants, setPlants] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPlant, setDeletingPlant] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plantsData, zonesData] = await Promise.all([
        plantsService.getAll(),
        zonesService.getAll()
      ]);
      
      const plantsArray = plantsData.data?.plants || [];
      
      if (plantsArray.length > 0) {
        const plantsWithData = plantsArray.map(plant => {
          const plantStatus = getPlantStatus(plant);
          return {
            ...plant,
            daysUntilHarvest: plantStatus.daysUntilHarvest,
            harvestStatus: plantStatus.harvestStatus
          };
        });
        
        setPlants(plantsWithData);
      }
      
      if (zonesData) {
        setZones(zonesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plant) => {
    setEditingPlant(plant);
    setShowForm(true);
  };

  const handleDelete = (plant) => {
    setDeletingPlant(plant);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPlant) return;

    try {
      await plantsService.delete(deletingPlant._id || deletingPlant.id);
      await fetchData();
    } catch (error) {
      console.error('Error deleting plant:', error);
      alert('Error deleting plant: ' + (error.response?.data?.message || error.message));
    } finally {
      setShowDeleteModal(false);
      setDeletingPlant(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingPlant(null);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPlant(null);
    fetchData();
  };

  const filteredPlants = selectedZone === 'all' 
    ? plants 
    : plants.filter(plant => {
        if (plant.zone && typeof plant.zone === 'object') {
          return plant.zone.name === selectedZone;
        }
        return false;
      });

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Plants Management</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Manage all plants in your greenhouse zones</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200 font-medium flex items-center"
        >
          <span className="mr-2">+</span>
          Add New Plant
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-zinc-500 dark:text-zinc-400" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Filter by Zone:</span>
          <select 
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="border text-zinc-700 dark:text-zinc-200 border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-zinc-700"
          >
            <option value="all">All Zones</option>
            {zones.map(zone => (
              <option key={zone._id} value={zone.name}>
                {zone.name} - {zone.description}
              </option>
            ))}
          </select>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Showing {filteredPlants.length} plants
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
        <PlantTable
          plants={filteredPlants}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showZone={true}
        />
      </div>

      {showForm && (
        <PlantForm
          plant={editingPlant}
          onClose={handleFormClose}
          onSave={handleFormClose}
          zones={zones}
        />
      )}

      {/* Delete Plant Modal */}
      {showDeleteModal && (
        <PlantDeleteModal
          plant={deletingPlant}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default Plants;
