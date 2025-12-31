import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { plantsService, zonesService, sensorsService } from '../services/api';
import { Thermometer, Droplets, Sprout, Sun, Calendar, Clock, Edit, Trash2, Info, Shovel, Gauge, Plus, BatteryMedium, Battery, Cpu, MapPin, Leaf, Shrub, X } from 'lucide-react';
import { getPlantStatus } from '../utils/plantCalculations';
import Loading from '../components/common/Loading';
import GoBackBtn from '../components/common/GoBackBtn';
import PlantForm from '../components/plants/PlantForm';
import PlantDeleteModal from '../components/plants/PlantDeleteModal';
import AddSensor from '../components/plants/AddSensor';
import SensorDeleteModal from '../components/sensors/SensorDeleteModal';

const PlantDetail = () => {
  const { plantId } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plantSensors, setPlantSensors] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddSensor, setShowAddSensor] = useState(false);
  const [sensorToDelete, setSensorToDelete] = useState(null);
  const [showOptimalModal, setShowOptimalModal] = useState(false);
  const [optimalForm, setOptimalForm] = useState({
    temperatureMin: '',
    temperatureMax: '',
    humidityMin: '',
    humidityMax: '',
    soilMoistureMin: '',
    soilMoistureMax: '',
    lightMin: '',
    lightMax: '',
  });

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
      setPlantSensors(plantData.data.sensors || []);
      const oc = (plantData.data?.plant || plantData)?.optimalConditions || {};
      setOptimalForm({
        temperatureMin: oc.temperature?.min ?? '',
        temperatureMax: oc.temperature?.max ?? '',
        humidityMin: oc.humidity?.min ?? '',
        humidityMax: oc.humidity?.max ?? '',
        soilMoistureMin: oc.soilMoisture?.min ?? '',
        soilMoistureMax: oc.soilMoisture?.max ?? '',
        lightMin: oc.light?.min ?? '',
        lightMax: oc.light?.max ?? '',
      });
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

  const handleOpenSensorDelete = (sensor) => {
    setSensorToDelete(sensor);
  };

  const handleCloseSensorDelete = () => {
    setSensorToDelete(null);
  };

  const handleConfirmSensorDelete = async () => {
    if (!sensorToDelete) return;
    try {
      await sensorsService.delete(sensorToDelete._id);
      await fetchPlantDetail();
    } catch (error) {
      console.error('Error deleting sensor:', error);
      alert('Failed to delete sensor: ' + (error.response?.data?.message || error.message));
    } finally {
      setSensorToDelete(null);
    }
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    fetchPlantDetail(); // Refresh data after edit
  };

  // Number sensors of the same type for this plant
  const numberedPlantSensors = (() => {
    const groups = new Map();

    plantSensors.forEach((sensor) => {
      if (!sensor) return;
      const key = sensor.type;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(sensor);
    });

    const withIndex = new Map();
    groups.forEach((list) => {
      list.forEach((sensor, index) => {
        withIndex.set(sensor._id, index + 1);
      });
    });

    return plantSensors.map((sensor) => ({
      ...sensor,
      displayIndex: withIndex.get(sensor._id) || 1
    }));
  })();

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

      <div className="flex-col">
        <div className="flex gap-6 mb-6">
          <div className="bg-white w-full dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-lg p-3 border-b border-zinc-200 dark:border-zinc-700 flex items-center font-semibold text-zinc-900 dark:text-white"><div className="size-8 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <Info size={20} className="text-blue-700 dark:text-blue-400" /></div><span className="ml-2">Plant Information</span></h3>
            <div className="grid grid-cols-3 gap-3 p-3">
              <div className="flex justify-between bg-zinc-50 rounded-md p-2 border border-zinc-200
              dark:bg-zinc-900 dark:border-zinc-700">
                <span className="text-zinc-600 dark:text-gray-400">Name:</span>
                <span className="font-medium text-zinc-900 dark:text-white">{plant.name}</span>
              </div>
              <div className="flex justify-between bg-zinc-50 rounded-md p-2 border border-zinc-200
              dark:bg-zinc-900 dark:border-zinc-700">
                <span className="text-zinc-600 dark:text-gray-400">Type:</span>
                <span className="font-medium text-zinc-900 dark:text-white capitalize">{plant.type}</span>
              </div>
              <div className="flex justify-between bg-zinc-50 rounded-md p-2 border border-zinc-200
              dark:bg-zinc-900 dark:border-zinc-700">
                <span className="text-zinc-600 dark:text-gray-400">Zone:</span>
                <span className="font-medium text-zinc-900 dark:text-white">{plant.zone?.name || 'No Zone'}</span>
              </div>
              <div className="flex justify-between bg-zinc-50 rounded-md p-2 border border-zinc-200
              dark:bg-zinc-900 dark:border-zinc-700">
                <span className="text-zinc-600 dark:text-gray-400">Total sensors:</span>
                <span className="font-medium text-zinc-900 dark:text-white">{plantSensors.length}</span>
              </div>
              <div className="flex justify-between bg-zinc-50 rounded-md p-2 border border-zinc-200
              dark:bg-zinc-900 dark:border-zinc-700">
                <span className="text-zinc-600 dark:text-gray-400">Planted:</span>
                <span className="font-medium text-zinc-900 dark:text-white">
                  {new Date(plant.plantingDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between bg-zinc-50 rounded-md p-2 border border-zinc-200
              dark:bg-zinc-900 dark:border-zinc-700">
                <span className="text-zinc-600 dark:text-gray-400">Days to Mature:</span>
                <span className="font-medium text-zinc-900 dark:text-white">{plant.daysToMature || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white w-full dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-lg p-3 border-b border-zinc-200 dark:border-zinc-700 flex items-center font-semibold text-zinc-900 dark:text-white"><div className="size-8 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Shovel size={20} className="text-amber-700 dark:text-amber-400" /></div><span className="ml-2">Harvest Status</span></h3>
            <div className="space-y-3 p-3">
              <div className="flex justify-between bg-zinc-50 rounded-md p-2 border border-zinc-200
                dark:bg-zinc-900 dark:border-zinc-700">
                <div className="flex items-center space-x-2">
                  <Clock size={18} className="text-blue-500" />
                  <span className="text-zinc-600 dark:text-gray-400">Time to Harvest:</span>
                </div>
                <span className={`font-medium ${plantStatus.harvestStatus.color}`}>
                  {plantStatus.harvestStatus.text}
                </span>
              </div>
              <div className="flex justify-between bg-zinc-50 rounded-md p-2 border border-zinc-200
                dark:bg-zinc-900 dark:border-zinc-700">
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

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-700 items-center">
              <h3 className="flex p-3 items-center space-x-1 text-lg font-semibold text-zinc-900 dark:text-white">
              <div className="size-10 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><Gauge size={28} className="text-purple-700 dark:text-purple-400" /></div><span className="ml-2">Sensor Readings</span></h3>
              <button
                onClick={() => setShowAddSensor(true)}
                className="flex items-center space-x-2 m-3 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 font-medium"
              >
                <Plus size={16} />
                <span>Add Sensor</span>
              </button>
            </div>

            {plantSensors.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4 opacity-30">📡</div>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-2">
                  No sensors attached to this plant yet
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  Add a sensor to start monitoring temperature, humidity, soil moisture, or light.
                </p>
              </div>
            ) : (
              <div className="grid p-3 grid-cols-1 md:grid-cols-3 gap-5">
                {numberedPlantSensors.map((sensor) => {
                  const isPlantSensor = !!sensor.plant;
                  const plantName = sensor.plant?.name || plant.name;
  
                  const typeLabels = {
                    temperature: 'Temperature',
                    humidity: 'Humidity',
                    soilMoisture: 'Soil Moisture',
                    light: 'Light'
                  };
  
                  const typeLabel = typeLabels[sensor.type] || sensor.type;
  
                  const scopeLabel = isPlantSensor
                    ? `Plant: ${plantName || 'Unknown plant'}`
                    : 'General sensor for this zone';
  
                  const displayName =
                    (isPlantSensor && sensor.name?.startsWith('General'))
                      ? `${typeLabel} Sensor ${sensor.displayIndex}`
                      : (sensor.name ||
                        (isPlantSensor
                          ? `${typeLabel} Sensor ${sensor.displayIndex}`
                          : `General ${typeLabel} Sensor ${sensor.displayIndex}`));
  
                  return (
                    <div key={sensor._id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {sensor.type === 'temperature' && <Thermometer size={24} className="text-red-500" />}
                        {sensor.type === 'humidity' && <Droplets size={24} className="text-blue-500" />}
                        {sensor.type === 'soilMoisture' && <Sprout size={24} className="text-green-500" />}
                        {sensor.type === 'light' && <Sun size={24} className="text-yellow-500" />}
                        <div>
                          <div className="font-medium text-zinc-900 dark:text-white capitalize">
                            {typeLabel}
                          </div>
                          <div className="text-sm text-zinc-500 dark:text-gray-300">
                            {displayName}
                          </div>
                          <div className="text-xs flex items-center text-zinc-400 dark:text-zinc-400 mt-0.5">
                            <Leaf size={14} className='mr-1' />{scopeLabel}
                          </div>
                          {sensor.location && (
                            <div className="text-xs flex items-center text-zinc-400 dark:text-zinc-400 mt-0.5">
                              <MapPin size={14} className='mr-1' />Location: {sensor.location}
                            </div>
                          )}
                          {sensor.hardwareId && (
                            <div className="text-xs flex items-center text-zinc-400 dark:text-zinc-400 mt-0.5">
                              <Cpu size={14} className='mr-1' />HW: {sensor.hardwareId}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        {(Math.round(sensor.batteryLevel)) > 0 ? (
                          <div className="text-xl font-bold text-zinc-900 dark:text-white">
                            {sensor.value} {sensor.unit}
                          </div>
                        ) : (
                          <div className="text-lg font-medium text-zinc-900 dark:text-white">
                            No data
                          </div>
                        )}
                        <div className="text-xs text-zinc-500 dark:text-gray-400">
                          {sensor.lastUpdate && `Updated ${new Date(sensor.lastUpdate).toLocaleTimeString()}`}
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          {sensor.connectionStatus && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                              {sensor.connectionStatus === 'connected' ? (
                                <div className='flex items-center'><span className='size-2 mr-1 rounded-full bg-green-500'></span>Online</div>
                              ) : (
                                <div className='flex items-center'><span className='size-2 mr-1 rounded-full bg-red-500'></span>Offline</div>
                              )}
                            </span>
                          )}
                          {typeof sensor.batteryLevel === 'number' && (
                            <span className="text-[11px] flex items-center text-zinc-500 dark:text-zinc-400">
                              {Math.round(sensor.batteryLevel)}% {Math.round(sensor.batteryLevel) === 0 ?
                              <Battery className='ml-1' size={20} /> : <BatteryMedium className='ml-1' size={20} />}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleOpenSensorDelete(sensor)}
                          className="inline-flex p-1 rounded-md items-center gap-1 text-xs duration-75
                          text-red-600 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-950/65">
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <div className="flex justify-between p-3 border-b border-zinc-200 dark:border-zinc-700 items-center">
              <h3 className="flex items-center space-x-1 text-lg font-semibold text-zinc-900 dark:text-white">
              <div className="size-10 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Shrub size={28} className="text-emerald-700 dark:text-emerald-400" /></div><span className="ml-2">Growth Information</span></h3>
              <button
                onClick={() => setShowOptimalModal(true)}
                className="inline-flex items-center font-medium gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit size={14} />
                Edit Optimal Conditions
              </button>
            </div>
            <div className="grid grid-cols-1 p-6 md:grid-cols-2 gap-6">
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

      {showAddSensor && (
        <AddSensor
          zone={plant.zone}
          plant={plant}
          onClose={() => setShowAddSensor(false)}
          onSuccess={() => {
            fetchPlantDetail();
            setShowAddSensor(false);
          }}
        />
      )}

      {sensorToDelete && (
        <SensorDeleteModal
          sensor={sensorToDelete}
          onClose={handleCloseSensorDelete}
          onConfirm={handleConfirmSensorDelete}
        />
      )}

      {showOptimalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-2xl w-full max-w-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <Edit size={18} className="text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">Edit Optimal Conditions</span>
              </div>
              <button
                onClick={() => setShowOptimalModal(false)}
                className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {[
                { key: 'temperature', label: 'Temperature (°C)' },
                { key: 'humidity', label: 'Air Humidity (%)' },
                { key: 'soilMoisture', label: 'Soil Moisture (%)' },
                { key: 'light', label: 'Light (lux)' },
              ].map(({ key, label }) => (
                <div key={key} className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">{label} min</label>
                    <input
                      type="number"
                      className="w-full text-zinc-700 dark:text-zinc-300 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm px-3 py-2"
                      value={optimalForm[`${key}Min`]}
                      onChange={(e) => setOptimalForm((prev) => ({ ...prev, [`${key}Min`]: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">{label} max</label>
                    <input
                      type="number"
                      className="w-full text-zinc-700 dark:text-zinc-300 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm px-3 py-2"
                      value={optimalForm[`${key}Max`]}
                      onChange={(e) => setOptimalForm((prev) => ({ ...prev, [`${key}Max`]: e.target.value }))}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-700 flex justify-end gap-2">
              <button
                onClick={() => setShowOptimalModal(false)}
                className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const num = (val) => (val === '' || val === null || val === undefined ? null : Number(val));
                  const payload = {
                    optimalConditions: {
                      temperature: { min: num(optimalForm.temperatureMin), max: num(optimalForm.temperatureMax) },
                      humidity: { min: num(optimalForm.humidityMin), max: num(optimalForm.humidityMax) },
                      soilMoisture: { min: num(optimalForm.soilMoistureMin), max: num(optimalForm.soilMoistureMax) },
                      light: { min: num(optimalForm.lightMin), max: num(optimalForm.lightMax) },
                    },
                  };
                  try {
                    await plantsService.update(plantId, payload);
                    await fetchPlantDetail();
                    setShowOptimalModal(false);
                  } catch (err) {
                    console.error('Failed to update optimal conditions', err);
                    alert('Failed to update optimal conditions.');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantDetail;
