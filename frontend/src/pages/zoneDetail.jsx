import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { zonesService, devicesService, sensorsService } from '../services/api';
import { MapPin, Thermometer, Droplets, Sprout, Sun, Power, Fan, Waves, Lightbulb, Flame, Trash2, Plus, Info, CircleCheckBig, Gauge, Leaf, Battery, BatteryMedium, Cpu } from 'lucide-react';
import { getPlantStatus } from '../utils/plantCalculations';
import PlantStatusCard from '../components/plants/PlantStatusCard'
import Loading from '../components/common/Loading';
import GoBackBtn from '../components/common/GoBackBtn';
import ZoneDeleteModal from '../components/zones/ZoneDeleteModal';
import DeviceForm from '../components/devices/DeviceForm';
import AddSensorForm from '../components/sensors/AddSensorForm';
import SensorDeleteModal from '../components/sensors/SensorDeleteModal';

const ZoneDetail = () => {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const [zone, setZone] = useState(null);
  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [showSensorForm, setShowSensorForm] = useState(false);
  const [sensorToDelete, setSensorToDelete] = useState(null);

  useEffect(() => {
    if (zoneId) {
      fetchZoneDetail();
    }
  }, [zoneId]);

  const fetchZoneDetail = async () => {
    try {
      setLoading(true);
      
      // ۱. گرفتن داده‌ها
      const [zoneResponse, devicesResponse, sensorsResponse] = await Promise.all([
        zonesService.getOne(zoneId),
        devicesService.getAll(),
        sensorsService.getAll()
      ]);

      // ۲. پردازش zone
      const zoneData = zoneResponse.data?.zone || zoneResponse;
      setZone(zoneData);
      
      const zoneIdStr = zoneData._id.toString();
      console.log('📍 Zone ID (string):', zoneIdStr);

      // ۳. پردازش دستگاه‌ها
      if (devicesResponse?.data?.devices) {
        const zoneDevices = devicesResponse.data.devices.filter(device => {
          const deviceZoneId = device.zone?._id || device.zone;
          return deviceZoneId?.toString() === zoneIdStr;
        });
        setDevices(zoneDevices);
        console.log('🔌 Zone devices found:', zoneDevices.length);
      }

      // ۴. پردازش سنسورها - مهم!
      console.log('📡 Raw sensors response:', sensorsResponse);
      
      // استخراج آرایه سنسورها از response
      let allSensors = [];
      
      if (sensorsResponse?.data?.sensors) {
        // حالت: { data: { sensors: [...] } }
        allSensors = sensorsResponse.data.sensors;
      } else if (sensorsResponse?.data && Array.isArray(sensorsResponse.data)) {
        // حالت: { data: [...] }
        allSensors = sensorsResponse.data;
      } else if (Array.isArray(sensorsResponse)) {
        // حالت: [...]
        allSensors = sensorsResponse;
      } else if (sensorsResponse?.sensors) {
        // حالت: { sensors: [...] }
        allSensors = sensorsResponse.sensors;
      }
      
      console.log('📊 All sensors extracted:', allSensors.length);

      // فیلتر کردن سنسورهای این zone
      const zoneSensors = allSensors.filter(sensor => {
        if (!sensor) return false;
        
        // گرفتن zone ID سنسور به هر شکل ممکن
        const sensorZoneId = sensor.zone?._id || sensor.zone || sensor.zoneId;
        
        // اگر zone ID نداره، ردش کن
        if (!sensorZoneId) {
          console.log('⚠️ Sensor has no zone:', sensor._id);
          return false;
        }
        
        // تبدیل به string برای مقایسه
        const sensorZoneStr = sensorZoneId.toString();
        const isMatch = sensorZoneStr === zoneIdStr;
        
        if (isMatch) {
          console.log('✅ Sensor matched:', sensor._id, sensor.type);
        }
        
        return isMatch;
      });

      console.log('🎯 Final zone sensors:', zoneSensors.length);
      setSensors(zoneSensors);

    } catch (error) {
      console.error('❌ Error fetching zone details:', error);
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
  };

  const handleDeviceFormSave = () => {
    setShowDeviceForm(false);
    fetchZoneDetail(); // Refresh data after adding device
  };

  const handleSensorFormClose = () => {
    setShowSensorForm(false);
  };

  const handleSensorFormSave = () => {
    setShowSensorForm(false);
    fetchZoneDetail(); // Refresh data after adding sensor
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
    } catch (error) {
      console.error('Error deleting sensor:', error);
      alert('Failed to delete sensor: ' + (error.response?.data?.message || error.message));
    } finally {
      setSensorToDelete(null);
      fetchZoneDetail();
    }
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

  // Enrich sensors with per‑type numbering per scope (general vs per‑plant)
  const numberedSensors = (() => {
    const groups = new Map();

    sensors.forEach((sensor) => {
      if (!sensor) return;
      const scopeKey = sensor.plant?._id || sensor.plant || 'zone';
      const key = `${scopeKey}-${sensor.type}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(sensor);
    });

    const withIndex = new Map();
    groups.forEach((list, key) => {
      list.forEach((sensor, index) => {
        withIndex.set(sensor._id, index + 1);
      });
    });

    return sensors.map((sensor) => ({
      ...sensor,
      displayIndex: withIndex.get(sensor._id) || 1
    }));
  })();

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

      <div className="flex-col">
        <div className="flex space-x-6 mb-6">
          <div className="bg-white w-full dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg p-3 border-b pb-2 border-zinc-200 dark:border-zinc-700 flex items-center font-semibold text-zinc-900 dark:text-white"><div className="size-8 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Info size={20} className="text-amber-700 dark:text-amber-400" /></div><span className="ml-2">Zone Information</span></h3>
            <div className="flex-col space-y-3 p-3">
              <div className='grid grid-cols-2 gap-3'>
                <div className="flex justify-between bg-zinc-50 rounded-md p-2 border border-zinc-200
                dark:bg-zinc-900 dark:border-zinc-700">
                  <span className="text-zinc-600 dark:text-gray-400">Name:</span>
                  <span className="font-medium text-zinc-900 dark:text-white">{zone.name}</span>
                </div>
                <div className="flex justify-between bg-zinc-50 rounded-md p-2 border border-zinc-200
                dark:bg-zinc-900 dark:border-zinc-700">
                  <span className="text-zinc-600 dark:text-gray-400">Description:</span>
                  <span className="font-medium text-zinc-900 dark:text-white">{zone.description}</span>
                </div>
              </div>
              <div className='grid grid-cols-3 gap-3'>
                <div className="flex justify-between bg-zinc-50 rounded-md p-2 border border-zinc-200
                dark:bg-zinc-900 dark:border-zinc-700">
                  <span className="text-zinc-600 dark:text-gray-400">Plants:</span>
                  <span className="font-medium text-zinc-900 dark:text-white">{zone.plants?.length || 0}</span>
                </div>
                <div className="flex justify-between bg-zinc-50 rounded-md p-2 border border-zinc-200
                dark:bg-zinc-900 dark:border-zinc-700">
                  <span className="text-zinc-600 dark:text-gray-400">Devices:</span>
                  <span className="font-medium text-zinc-900 dark:text-white">{devices.length}</span>
                </div>
                <div className="flex justify-between bg-zinc-50 rounded-md p-2 border border-zinc-200
                dark:bg-zinc-900 dark:border-zinc-700">
                  <span className="text-zinc-600 dark:text-gray-400">Sensors:</span>
                  <span className="font-medium text-zinc-900 dark:text-white">{sensors.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white w-full dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg p-3 border-b pb-2 border-zinc-200 dark:border-zinc-700 flex items-center font-semibold text-zinc-900 dark:text-white"><div className="size-8 rounded-md bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
            <CircleCheckBig size={20} className="text-sky-700 dark:text-sky-400" /></div><span className="ml-2">Optimal Conditions</span></h3>
            <div className="grid grid-cols-2 gap-3 p-3">
              <div className="flex justify-between bg-zinc-50 rounded-md p-2 border border-zinc-200
              dark:bg-zinc-900 dark:border-zinc-700">
                <span className="text-zinc-600 dark:text-gray-400">Temperature:</span>
                <span className="font-medium text-zinc-900 dark:text-white">
                  {zone.settings?.temperature?.min || 0}°C - {zone.settings?.temperature?.max || 0}°C
                </span>
              </div>
              <div className="flex justify-between bg-zinc-50 rounded-md p-2 border border-zinc-200
              dark:bg-zinc-900 dark:border-zinc-700">
                <span className="text-zinc-600 dark:text-gray-400">Humidity:</span>
                <span className="font-medium text-zinc-900 dark:text-white">
                  {zone.settings?.humidity?.min || 0}% - {zone.settings?.humidity?.max || 0}%
                </span>
              </div>
              <div className="flex justify-between bg-zinc-50 rounded-md p-2 border border-zinc-200
              dark:bg-zinc-900 dark:border-zinc-700">
                <span className="text-zinc-600 dark:text-gray-400">Soil Moisture:</span>
                <span className="font-medium text-zinc-900 dark:text-white">
                  {zone.settings?.soilMoisture?.min || 0}% - {zone.settings?.soilMoisture?.max || 0}%
                </span>
              </div>
              <div className="flex justify-between bg-zinc-50 rounded-md p-2 border border-zinc-200
              dark:bg-zinc-900 dark:border-zinc-700">
                <span className="text-zinc-600 dark:text-gray-400">Light:</span>
                <span className="font-medium text-zinc-900 dark:text-white">
                  {zone.settings?.light?.min || 0} - {zone.settings?.light?.max || 0} lux
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-700 items-center">
              <h3 className="flex p-3 items-center space-x-1 text-lg font-semibold text-zinc-900 dark:text-white">
              <div className="size-10 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Gauge size={28} className="text-purple-700 dark:text-purple-400" /></div><span className="ml-2">Sensor Readings</span></h3>
              <button
                onClick={() => setShowSensorForm(true)}
                className="flex items-center space-x-2 m-3 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 font-medium"
              >
                <Plus size={16} />
                <span>Add Sensor</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3">
              {numberedSensors.length === 0 && (
                <div className="md:col-span-3 text-center py-10">
                  <div className="text-5xl mb-3">📡</div>
                  <h4 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
                    No sensors configured for this zone
                  </h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-md mx-auto">
                    You haven&apos;t added any sensors to this zone yet. Add general zone sensors or plant-specific
                    sensors to start monitoring the environment.
                  </p>
                  <button
                    onClick={() => setShowSensorForm(true)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 text-sm font-medium"
                  >
                    <Plus size={16} />
                    <span>Add your first sensor</span>
                  </button>
                </div>
              )}

              {numberedSensors.map(sensor => {
                const isPlantSensor = !!sensor.plant;
                const plantName = sensor.plant?.name || sensor.plantName;

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
                  sensor.name ||
                  (isPlantSensor
                    ? `${typeLabel} Sensor ${sensor.displayIndex}`
                    : `General ${typeLabel} Sensor ${sensor.displayIndex}`);

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
                      {(Math.round(sensor.batteryLevel)) > 0 ? (<div className="text-xl font-bold text-zinc-900 dark:text-white">
                        {sensor.value} {sensor.unit}
                      </div>) : <div className="text-lg font-medium text-zinc-900 dark:text-white">
                        No data
                      </div>}
                      <div className="text-xs text-zinc-500 dark:text-gray-400">
                        {sensor.lastUpdate && `Updated ${new Date(sensor.lastUpdate).toLocaleTimeString()}`}
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        {sensor.connectionStatus && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                            {sensor.connectionStatus === 'connected' ? <div className='flex items-center'><span className='size-2 mr-1 rounded-full bg-green-500'>
                            </span>Online</div> : <div className='flex items-center'><span className='size-2 mr-1 rounded-full bg-red-500'></span>Ofline</div>}
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
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-700 items-center">
              <h3 className="flex p-3 items-center space-x-1 text-lg font-semibold text-zinc-900 dark:text-white">
              <div className="size-10 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Power size={28} className="text-blue-700 dark:text-blue-400" /></div><span className="ml-2">Device Control</span></h3>
              <button
                onClick={() => setShowDeviceForm(true)}
                className="flex items-center space-x-2 m-3 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 font-medium"
              >
                <Plus size={16} />
                <span>Add Device</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3">
              {devices.length === 0 && (
                <div className="md:col-span-3 text-center py-10">
                  <div className="text-5xl mb-3">🔌</div>
                  <h4 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
                    No devices connected in this zone
                  </h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-md mx-auto">
                    You haven&apos;t added any controllable devices yet. Add pumps, fans, heaters or lights to manage
                    this zone automatically.
                  </p>
                  <button
                    onClick={() => setShowDeviceForm(true)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 text-sm font-medium"
                  >
                    <Plus size={16} />
                    <span>Add your first device</span>
                  </button>
                </div>
              )}

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

          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-700 items-center">
              <h3 className="flex p-3 items-center space-x-1 text-lg font-semibold text-zinc-900 dark:text-white">
              <div className="size-10 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><Leaf size={28} className="text-green-700 dark:text-green-400" /></div><span className="ml-2">Plants in this Zone</span></h3>
              <span className='text-sm mr-3 text-zinc-700 dark:text-zinc-300 hover:text-green-500 hover:underline'>
              <Link to={'/plants'}>+ Adding new plants</Link></span>
            </div>
            {zone.plants && zone.plants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 p-3 gap-4">
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
          onSave={handleDeviceFormSave}
          preSelectedZone={zone}
        />
      )}

      {showSensorForm && (
        <AddSensorForm
          zone={zone}
          plants={zone.plants || []}
          onClose={handleSensorFormClose}
          onSuccess={handleSensorFormSave}
        />
      )}

      {sensorToDelete && (
        <SensorDeleteModal
          sensor={sensorToDelete}
          onClose={handleCloseSensorDelete}
          onConfirm={handleConfirmSensorDelete}
        />
      )}
    </div>
  );
};

export default ZoneDetail;
