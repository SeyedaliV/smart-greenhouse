import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { zonesService, devicesService, sensorsService } from '../services/api';
import { MapPin, Thermometer, Droplets, Sprout, Sun, Power, Fan, Waves, Lightbulb, Flame } from 'lucide-react';
import { getPlantStatus } from '../utils/plantCalculations';
import PlantStatusCard from '../components/plants/PlantStatusCard'
import Loading from '../components/common/Loading';

const ZoneDetail = () => {
  const { zoneId } = useParams();
  const [zone, setZone] = useState(null);
  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);

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
          device.zone === zoneData.name
        );
        setDevices(zoneDevices);
      }

      if (sensorsData && Array.isArray(sensorsData)) {
        const zoneNames = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
        const currentZoneIndex = zoneNames.indexOf(zoneData.name);
        const sensorsPerZone = 4;
        const startIndex = currentZoneIndex * sensorsPerZone;
        const zoneSensors = sensorsData.slice(startIndex, startIndex + sensorsPerZone);
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

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'waterPump': return <Waves size={24} className="text-blue-500" />;
      case 'fan': return <Fan size={24} className="text-gray-500" />;
      case 'light': return <Lightbulb size={24} className="text-yellow-500" />;
      case 'heater': return <Flame size={24} className="text-red-500" />;
      default: return <Power size={24} />;
    }
  };

  const getDeviceStatusColor = (status) => {
    switch (status) {
      case 'ON': return 'bg-green-100 text-green-800 border-green-200';
      case 'OFF': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'AUTO': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
        <div className="text-gray-400 text-6xl mb-4">🏗️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Zone not found</h3>
        <p className="text-gray-600 mb-2">Zone ID: <code>{zoneId}</code></p>
        <Link to="/plants" className="text-green-500 hover:text-green-600">
          Back to Plants
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/plants" className="text-green-500 hover:text-green-600 flex items-center">
            Back to Plants
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{zone.name}</h1>
            <p className="text-gray-600 flex items-center">
              <MapPin size={16} className="mr-1" />
              {zone.description} • Zone Management
            </p>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium border ${
          zone.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
        }`}>
          {zone.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Zone Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{zone.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Description:</span>
                <span className="font-medium text-gray-900">{zone.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plants:</span>
                <span className="font-medium text-gray-900">{zone.plants?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Devices:</span>
                <span className="font-medium text-gray-900">{devices.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sensors:</span>
                <span className="font-medium text-gray-900">{sensors.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimal Conditions</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Temperature:</span>
                <span className="font-medium text-gray-900">
                  {zone.settings?.temperature?.min || 0}°C - {zone.settings?.temperature?.max || 0}°C
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Humidity:</span>
                <span className="font-medium text-gray-900">
                  {zone.settings?.humidity?.min || 0}% - {zone.settings?.humidity?.max || 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Soil Moisture:</span>
                <span className="font-medium text-gray-900">
                  {zone.settings?.soilMoisture?.min || 0}% - {zone.settings?.soilMoisture?.max || 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Light:</span>
                <span className="font-medium text-gray-900">
                  {zone.settings?.light?.min || 0} - {zone.settings?.light?.max || 0} lux
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sensor Readings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sensors.map(sensor => (
                <div key={sensor._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {sensor.type === 'temperature' && <Thermometer size={24} className="text-red-500" />}
                    {sensor.type === 'humidity' && <Droplets size={24} className="text-blue-500" />}
                    {sensor.type === 'soilMoisture' && <Sprout size={24} className="text-green-500" />}
                    {sensor.type === 'light' && <Sun size={24} className="text-yellow-500" />}
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{sensor.type}</div>
                      <div className="text-sm text-gray-500">{sensor.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      {sensor.value} {sensor.unit}
                    </div>
                    <div className="text-sm text-gray-500">Current</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Control</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {devices.map(device => (
                <div key={device._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(device.type)}
                    <div>
                      <div className="font-medium text-gray-900">{device.name}</div>
                      <div className="text-sm text-gray-500">Power: {device.powerConsumption}W</div>
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
                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                      >
                        OFF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plants in this Zone</h3>
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
                <div className="text-gray-400 text-4xl mb-2">🌱</div>
                <p className="text-gray-500">No plants in this zone</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoneDetail;