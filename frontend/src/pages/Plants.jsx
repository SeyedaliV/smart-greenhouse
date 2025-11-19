import { useState, useEffect } from 'react';
import PlantTable from '../components/plants/PlantTable';
import PlantForm from '../components/plants/PlantForm';
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

  const handleDelete = async (plantId) => {
    if (window.confirm('Are you sure you want to delete this plant?')) {
      try {
        await plantsService.delete(plantId);
        await fetchData();
      } catch (error) {
        console.error('Error deleting plant:', error);
        alert('Error deleting plant: ' + error.message);
      }
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Plants Management</h1>
          <p className="text-gray-600">Manage all plants in your greenhouse zones</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200 font-medium flex items-center"
        >
          <span className="mr-2">+</span>
          Add New Plant
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by Zone:</span>
          <select 
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="border text-zinc-700 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Zones</option>
            {zones.map(zone => (
              <option key={zone._id} value={zone.name}>
                {zone.name} - {zone.description}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            Showing {filteredPlants.length} plants
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
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
    </div>
  );
};

export default Plants;