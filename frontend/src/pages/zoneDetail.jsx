import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { zonesService, devicesService, sensorsService } from '../services/api';
import { MapPin, Thermometer, Droplets, Sprout, Sun, Power, Fan, Waves, Lightbulb, Flame, Trash2, Plus } from 'lucide-react';
import { getPlantStatus } from '../utils/plantCalculations';
import PlantStatusCard from '../components/plants/PlantStatusCard'
import Loading from '../components/common/Loading';
import GoBackBtn from '../components/common/GoBackBtn';
import ZoneDeleteModal from '../components/zones/ZoneDeleteModal';
import DeviceForm from '../components/devices/DeviceForm';

const ZoneDetail = () => {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const [zone, setZone] = useState(null);
  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeviceForm, setShowDeviceForm] = useState(false);

  useEffect(() => {
    if (zoneId) {
      fetchZoneDetail();
    }
  }, [zoneId]);

  const fetchZoneDetail = async () => {
    try {
      setLoading(true);
      const [zoneData, devicesData, sensorsData] = await Promise.all([
        zonesService.getOne(zoneId),
        devicesService.getAll(),
        sensorsService.getAll()
      ]);

      setZone(zoneData);
      
      if (devicesData?.data?.devices) {
        const zoneDevices = devicesData.data.devices.filter(device => 
          device.zone?._id === zoneData._id || device.zone === zoneData._id
        );
        setDevices(zoneDevices);
      }

      if (sensorsData && Array.isArray(sensorsData)) {
        const zoneSensors = sensorsData.filter(sensor => 
          sensor.zone?._id === zoneData._id || sensor.zone === zoneData._id
        );
        setSensors(zoneSensors);
      }

    } catch (error) {
      console.error('Error fetching zone details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceControl = async (deviceId, action) => {
    try {
      await devicesService.control(deviceId, { status: action });
      fetchZoneDetail();
    } catch (error) {
      console.error('Error controlling device:', error);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await zonesService.delete(zoneId);
      navigate('/zones');
    } catch (error) {
      console.error('Error deleting zone:', error);
      alert('Error deleting zone: ' + (error.response?.data?.message || error.message));
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleDeviceFormClose = () => {
    setShowDeviceForm(false);
    fetchZoneDetail(); // Refresh data after adding device
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'waterPump': return <Waves size={24} className="text-blue-500" />;
      case 'fan': return <Fan size={24} className="text-zinc-500" />;
      case 'light': return <Lightbulb size={24} className="text-yellow-500" />;
      case 'heater': return <Flame size={24} className="text-red-500" />;
      default: return <Power size={24} />;
    }
  };

  const getDeviceStatusColor = (status) => {
    switch (status) {
      case 'ON': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'OFF': return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
      case 'AUTO': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default: return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
    }
  };

  if (loading) {
    return (
      <Loading />
    );
  }

  if (!zone) {
    return (
      <div className="text-center py-12">
        <div className="text-zinc-400 text-6xl mb-4">🏗️</div>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">Zone not found</h3>
        <p className="text-zinc-600 dark:text-gray-400 mb-2">Zone ID: <code>{zoneId}</code></p>
        <Link to="/plants" className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300">
          Back to Plants
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <GoBackBtn />
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{zone.name}</h1>
            <p className="text-zinc-600 dark:text-gray-400 flex items-center">
              <MapPin size={16} className="mr-1" />
              {zone.description} • Zone Management
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-4 py-2 rounded-full text-sm font-medium border ${
            zone.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
          }`}>
            {zone.status}
          </span>
          <button
            onClick={handleDeleteClick}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 font-medium"
          >
            <Trash2 size={16} />
            <span>Delete Zone</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Zone Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-gray-400">Name:</span>
                <span className="font-medium text-zinc-900 dark:text-white">{zone.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-gray-400">Description:</span>
                <span className="font-medium text-zinc-900 dark:text-white">{zone.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-gray-400">Plants:</span>
                <span className="font-medium text-zinc-900 dark:text-white">{zone.plants?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-gray-400">Devices:</span>
                <span className="font-medium text-zinc-900 dark:text-white">{devices.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-gray-400">Sensors:</span>
                <span className="font-medium text-zinc-900 dark:text-white">{sensors.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Optimal Conditions</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-gray-400">Temperature:</span>
                <span className="font-medium text-zinc-900 dark:text-white">
                  {zone.settings?.temperature?.min || 0}°C - {zone.settings?.temperature?.max || 0}°C
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-gray-400">Humidity:</span>
                <span className="font-medium text-zinc-900 dark:text-white">
                  {zone.settings?.humidity?.min || 0}% - {zone.settings?.humidity?.max || 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-gray-400">Soil Moisture:</span>
                <span className="font-medium text-zinc-900 dark:text-white">
                  {zone.settings?.soilMoisture?.min || 0}% - {zone.settings?.soilMoisture?.max || 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-gray-400">Light:</span>
                <span className="font-medium text-zinc-900 dark:text-white">
                  {zone.settings?.light?.min || 0} - {zone.settings?.light?.max || 0} lux
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Sensor Readings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sensors.map(sensor => (
                <div key={sensor._id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {sensor.type === 'temperature' && <Thermometer size={24} className="text-red-500" />}
                    {sensor.type === 'humidity' && <Droplets size={24} className="text-blue-500" />}
                    {sensor.type === 'soilMoisture' && <Sprout size={24} className="text-green-500" />}
                    {sensor.type === 'light' && <Sun size={24} className="text-yellow-500" />}
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-white capitalize">{sensor.type}</div>
                      <div className="text-sm text-zinc-500 dark:text-gray-400">{sensor.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-zinc-900 dark:text-white">
                      {sensor.value} {sensor.unit}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-gray-400">Current</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Device Control</h3>
              <button
                onClick={() => setShowDeviceForm(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 font-medium"
              >
                <Plus size={16} />
                <span>Add Device</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {devices.map(device => (
                <div key={device._id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(device.type)}
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-white">{device.name}</div>
                      <div className="text-sm text-zinc-500 dark:text-gray-400">Power: {device.powerConsumption}W</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDeviceStatusColor(device.status)}`}>
                      {device.status}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleDeviceControl(device._id, 'ON')}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        ON
                      </button>
                      <button
                        onClick={() => handleDeviceControl(device._id, 'OFF')}
                        className="px-3 py-1 bg-zinc-500 text-white rounded text-sm hover:bg-zinc-600"
                      >
                        OFF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Plants in this Zone</h3>
            {zone.plants && zone.plants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zone.plants.map((plant) => {
                  const plantStatus = getPlantStatus(plant);
                  
                  // گیاه رو با daysUntilHarvest آپدیت شده به PlantStatusCard پاس بده
                  const plantWithHarvest = {
                    ...plant,
                    daysUntilHarvest: plantStatus.daysUntilHarvest
                  };
                  
                  return (
                    <PlantStatusCard key={plant._id} plant={plantWithHarvest} />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-zinc-400 text-4xl mb-2">🌱</div>
                <p className="text-zinc-500 dark:text-gray-400">No plants in this zone</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Zone Modal */}
      {showDeleteModal && (
        <ZoneDeleteModal
          zone={zone}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Add Device Modal */}
      {showDeviceForm && (
        <DeviceForm
          onClose={handleDeviceFormClose}
          onSave={handleDeviceFormClose}
          preSelectedZone={zone}
        />
      )}
    </div>
  );
};

export default ZoneDetail;
