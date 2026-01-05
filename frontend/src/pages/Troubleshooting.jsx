import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Wrench,
  Activity,
  Thermometer,
  Droplets,
  Sun,
  Leaf,
  Sprout,
  Power,
  Gauge,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { dashboardService, devicesService, zonesService, sensorsService, plantsService } from '../services/api';
import Loading from '../components/common/Loading';
import GoBackBtn from '../components/common/GoBackBtn';

const getAlertIcon = (type) => {
  switch (type) {
    case 'critical':
      return <AlertCircle size={18} className="text-red-600" />;
    case 'warning':
      return <AlertTriangle size={18} className="text-yellow-600" />;
    default:
      return <Info size={18} className="text-blue-600" />;
  }
};

const getAlertColor = (type) => {
  switch (type) {
    case 'critical':
      return 'border-red-200 dark:border-red-800';
    case 'warning':
      return 'border-yellow-200 dark:border-yellow-800';
    default:
      return 'border-blue-200 dark:border-blue-800';
  }
};

const Troubleshooting = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [devices, setDevices] = useState([]);
  const [zones, setZones] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [plants, setPlants] = useState([]);

  useEffect(() => {
    const initialIndex = Number(searchParams.get('alertIndex') ?? 0);
    if (!Number.isNaN(initialIndex) && initialIndex >= 0) {
      setSelectedIndex(initialIndex);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [dashboardRes, devicesRes, zonesRes, sensorsRes, plantsRes] =
          await Promise.all([
            dashboardService.getDashboard(),
            devicesService.getAll(),
            zonesService.getAll(),
            sensorsService.getAll(),
            plantsService.getAll(),
          ]);

        const dashboardData = dashboardRes?.data || dashboardRes;

        setAlerts(Array.isArray(dashboardData.alerts) ? dashboardData.alerts : []);

        setDevices(Array.isArray(devicesRes?.data?.devices) ? devicesRes.data.devices :
                   Array.isArray(devicesRes?.devices) ? devicesRes.devices :
                   Array.isArray(devicesRes) ? devicesRes : []);
        
        setZones(Array.isArray(zonesRes) ? zonesRes : []);
        
        setSensors(Array.isArray(sensorsRes) ? sensorsRes : []);
        
        setPlants(Array.isArray(plantsRes?.data?.plants) ? plantsRes.data.plants :
                  Array.isArray(plantsRes?.plants) ? plantsRes.plants :
                  Array.isArray(plantsRes) ? plantsRes : []);
      } catch (err) {
        console.error('Troubleshooting load error:', err);
        setError('Failed to load troubleshooting data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedAlert = alerts[selectedIndex] || null;

  const relatedZoneName = useMemo(() => {
    if (!selectedAlert?.message) return null;
    const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
    return zones.find((z) => selectedAlert.message.includes(z)) || null;
  }, [selectedAlert]);

  const relatedZone = useMemo(
    () => zones.find((z) => z.name === relatedZoneName),
    [zones, relatedZoneName],
  );

  const relatedDevices = useMemo(() => {
    if (!selectedAlert) return [];
    const related = [];

    // Filter devices by zone if alert mentions a zone
    if (relatedZoneName) {
      related.push(...devices.filter(d => d.zone === relatedZoneName));
    }

    // Filter devices mentioned in alert message
    devices.forEach(device => {
      if (selectedAlert.message && selectedAlert.message.includes(device.name)) {
        if (!related.find(d => d._id === device._id)) {
          related.push(device);
        }
      }
    });

    // If no specific devices found, show all devices in the related zone
    if (related.length === 0 && relatedZoneName) {
      return devices.filter(d => d.zone === relatedZoneName);
    }

    return related;
  }, [devices, relatedZoneName, selectedAlert]);

  const relatedSensors = useMemo(() => {
    if (!selectedAlert) return [];
    const related = [];

    // Filter sensors by zone if alert mentions a zone
    if (relatedZoneName) {
      related.push(...sensors.filter(s => s.zone === relatedZoneName));
    }

    // Filter sensors by type if alert mentions a sensor type
    if (selectedAlert.metric) {
      sensors.forEach(sensor => {
        if (sensor.type === selectedAlert.metric) {
          if (!related.find(s => s._id === sensor._id)) {
            related.push(sensor);
          }
        }
      });
    }

    // Filter sensors mentioned in alert message by type
    sensors.forEach(sensor => {
      if (selectedAlert.message) {
        const message = selectedAlert.message.toLowerCase();
        if (message.includes(sensor.type) || message.includes(sensor.name)) {
          if (!related.find(s => s._id === sensor._id)) {
            related.push(sensor);
          }
        }
      }
    });

    return related;
  }, [sensors, relatedZoneName, selectedAlert]);

  const relatedPlants = useMemo(() => {
    if (!selectedAlert) return [];
    const related = [];

    // Filter plants by type if alert mentions a plant type
    if (selectedAlert.plantType) {
      related.push(...plants.filter(p => p.type === selectedAlert.plantType));
    }

    // Filter plants by zone if alert mentions a zone
    if (relatedZone?._id) {
      plants.forEach(plant => {
        if (String(plant.zone) === String(relatedZone._id)) {
          if (!related.find(p => p._id === plant._id)) {
            related.push(plant);
          }
        }
      });
    }

    // Filter plants mentioned in alert message
    plants.forEach(plant => {
      if (selectedAlert.message && selectedAlert.message.includes(plant.name)) {
        if (!related.find(p => p._id === plant._id)) {
          related.push(plant);
        }
      }
    });

    return related;
  }, [plants, selectedAlert, relatedZone]);

  const handleDeviceControl = async (deviceId, newStatus) => {
    try {
      await devicesService.control(deviceId, { status: newStatus });
      setDevices((prev) =>
        prev.map((device) =>
          device.id === deviceId || device._id === deviceId
            ? { ...device, status: newStatus, lastAction: new Date() }
            : device,
        ),
      );
    } catch (err) {
      console.error('Error controlling device from troubleshooting:', err);
      alert(
        'Failed to control device: ' +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const handleResolveAlert = (index) => {
    setAlerts((prev) => prev.filter((_, i) => i !== index));
    if (index === selectedIndex) {
      setSelectedIndex(0);
    } else if (index < selectedIndex) {
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-lg text-zinc-800 dark:text-zinc-100 mb-2">
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GoBackBtn />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Wrench size={24} className="text-amber-500" />
              Troubleshooting & Alerts
            </h1>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
              Diagnose issues and control your IoT greenhouse in real time.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 text-right">
          <div className='flex items-center gap-3'>
          <button
              onClick={() => navigate('/logs')}
              className="inline-flex items-center px-3 py-1 bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
            >
              <Activity size={14} className="mr-1" />
              View full log
          </button>
          <span className="text-xs uppercase tracking-wide text-zinc-400">
            Active alerts
          </span>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-red-500" />
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {alerts.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex gap-3">
        {/* Alerts list */}
        <div className="lg:col-span-1 w-1/2 max-h-[calc(100vh)] overflow-y-auto">
          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden h-full flex flex-col">
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Alert queue
                </span>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Click an alert to troubleshoot
              </span>
            </div>

            <div className="flex-1 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 dark:text-zinc-400">
                  <ShieldCheck
                    size={32}
                    className="mx-auto mb-2 text-green-500"
                  />
                  <p className="font-medium">No active alerts</p>
                  <p className="text-xs">
                    All greenhouse systems are operating within normal
                    thresholds.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-700/60">
                  {alerts.map((alert, index) => (
                    <li
                      key={index}
                      onClick={() => setSelectedIndex(index)}
                      className={`cursor-pointer px-4 py-3 text-sm flex items-start gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
                        selectedIndex === index
                          ? 'bg-zinc-50 dark:bg-zinc-800'
                          : ''
                      }`}
                    >
                      <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
                          {alert.message}
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                          {alert.action}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                          {alert.source && (
                            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700">
                              Source: {alert.source}
                            </span>
                          )}
                          {alert.metric && (
                            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700">
                              Metric: {alert.metric}
                            </span>
                          )}
                          {alert.plantType && (
                            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700">
                              Crop: {alert.plantType}
                            </span>
                          )}
                          {alert.value && (
                            <span className="px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                              {alert.value}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Troubleshooting panel */}
        <div className="lg:col-span-2 space-y-3 w-full">
          {selectedAlert ? (
            <>
              {/* Selected alert header */}
              <div
                className={`border rounded-xl p-3 bg-white dark:bg-zinc-800/40 ${getAlertColor(
                  selectedAlert.type,
                )}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-1.5">
                      {getAlertIcon(selectedAlert.type)}
                    </div>
                    <div>
                      <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm md:text-base">
                        {selectedAlert.message}
                      </h2>
                      <p className="text-xs md:text-sm text-zinc-700 dark:text-zinc-300 mt-1">
                        {selectedAlert.action}
                      </p>
                      {relatedZoneName && (
                        <p className="mt-1 text-xs text-zinc-500">
                          Zone: {relatedZoneName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {selectedAlert.value && (
                      <span className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800/40
                      bg-white text-xs font-mono text-zinc-900 dark:text-zinc-300">
                        {selectedAlert.value}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleResolveAlert(selectedIndex)}
                      className="px-3 py-1.5 rounded bg-green-600 text-white text-xs hover:bg-green-700 flex items-center gap-1"
                    >
                      <ShieldCheck size={14} />
                      Resolve alert
                    </button>
                  </div>
                </div>
              </div>

              {/* Context: Zone & environment
              {relatedZone && (
                <div className="bg-white dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Activity size={18} className="text-blue-500" />
                      <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                        Zone environment ({relatedZone.name})
                      </h3>
                    </div>
                    <Link
                      to={`/zones/${relatedZone._id}`}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      View zone details
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-1.5">
                        <Thermometer size={14} className="text-red-500" />
                        <span className="text-zinc-600 dark:text-zinc-300">
                          Temp
                        </span>
                      </div>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {relatedZone.settings?.temperature?.optimal ?? '-'}°C
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-1.5">
                        <Droplets size={14} className="text-blue-500" />
                        <span className="text-zinc-600 dark:text-zinc-300">
                          Humidity
                        </span>
                      </div>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {relatedZone.settings?.humidity?.optimal ?? '-'}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-1.5">
                        <Sprout size={14} className="text-green-500" />
                        <span className="text-zinc-600 dark:text-zinc-300">
                          Soil
                        </span>
                      </div>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {relatedZone.settings?.soilMoisture?.optimal ?? '-'}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-1.5">
                        <Sun size={14} className="text-yellow-500" />
                        <span className="text-zinc-600 dark:text-zinc-300">
                          Light
                        </span>
                      </div>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {relatedZone.settings?.light?.optimal ?? '-'} lux
                      </span>
                    </div>
                  </div>
                </div>
              )} */}

              {/* IoT control panel */}
              <div className="grid gap-3">
                {/* Devices control */}
                <div className="bg-white h-auto dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                  <div className="flex p-3 border-b border-zinc-200 dark:border-zinc-700 items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Power size={18} className="text-blue-500" />
                      <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                        Devices control
                      </h3>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {relatedDevices.length} devices
                    </span>
                  </div>

                  {relatedDevices.length === 0 ? (
                    <p className="flex justify-center items-center text-sm pb-6 pt-3 text-zinc-500">
                      No devices associated with this alert.
                    </p>
                  ) : (
                    <div className="space-y-2 p-3 grid grid-cols-2 max-h-64 overflow-y-auto">
                      {relatedDevices.map((device) => (
                        <div
                          key={device.id || device._id}
                          className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 px-3 py-2 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">
                              {device.name}
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              Type: {device.type} · Zone:{' '}
                              {typeof device.zone === 'object' ? (device.zone?.name || device.zone?._id || 'N/A') : (device.zone || 'N/A')}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] ${
                                device.status === 'ON'
                                  ? 'bg-green-100 text-green-700'
                                  : device.status === 'AUTO'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-zinc-100 text-zinc-600'
                              }`}
                            >
                              {device.status || 'OFF'}
                            </span>
                            <button
                              onClick={() =>
                                handleDeviceControl(
                                  device.id || device._id,
                                  'ON',
                                )
                              }
                              className="px-2 py-0.5 rounded bg-green-600 text-white text-[10px] hover:bg-green-700"
                            >
                              ON
                            </button>
                            <button
                              onClick={() =>
                                handleDeviceControl(
                                  device.id || device._id,
                                  'OFF',
                                )
                              }
                              className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 text-[10px] hover:bg-zinc-300"
                            >
                              OFF
                            </button>
                            <button
                              onClick={() =>
                                handleDeviceControl(
                                  device.id || device._id,
                                  'AUTO',
                                )
                              }
                              className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] hover:bg-blue-700"
                            >
                              AUTO
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sensor & plant context */}
                <div className="space-y-3">
                  {/* Sensors */}
                  <div className="bg-white dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                    <div className="flex p-3 border-b border-zinc-200 dark:border-zinc-700 items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Gauge size={18} className="text-purple-500" />
                        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                          Sensors in area
                        </h3>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {relatedSensors.length} sensors
                      </span>
                    </div>

                    {relatedSensors.length === 0 ? (
                      <p className="flex justify-center items-center text-sm pb-6 pt-3 text-zinc-500">
                        No sensors found for this zone.
                      </p>
                    ) : (
                      <div className="space-y-2 p-3 max-h-32 overflow-y-auto">
                        {relatedSensors.map((sensor) => (
                          <div
                            key={sensor.id || sensor._id}
                            className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 px-3 py-2 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              {sensor.type === 'temperature' && (
                                <Thermometer
                                  size={14}
                                  className="text-red-500"
                                />
                              )}
                              {sensor.type === 'humidity' && (
                                <Droplets
                                  size={14}
                                  className="text-blue-500"
                                />
                              )}
                              {sensor.type === 'soilMoisture' && (
                                <Sprout
                                  size={14}
                                  className="text-green-500"
                                />
                              )}
                              {sensor.type === 'light' && (
                                <Sun
                                  size={14}
                                  className="text-yellow-500"
                                />
                              )}
                              <span className="font-medium text-zinc-800 dark:text-zinc-100">
                                {sensor.name}
                              </span>
                            </div>
                            <span className="font-mono text-[11px] text-zinc-800 dark:text-zinc-100">
                              {sensor.value}{sensor.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Plants */}
                  <div className="bg-white dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                    <div className="flex p-3 border-b border-zinc-200 dark:border-zinc-700 items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Leaf size={18} className="text-green-600" />
                        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                          Affected plants
                        </h3>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {relatedPlants.length} plants
                      </span>
                    </div>

                    {relatedPlants.length === 0 ? (
                      <p className="flex justify-center items-center text-sm pb-6 pt-3 text-zinc-500">
                        No plants matched for this alert.
                      </p>
                    ) : (
                      <div className="space-y-2 p-3 overflow-y-auto">
                        {relatedPlants.map((plant) => (
                          <div
                            key={plant.id || plant._id}
                            className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 px-3 py-2 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                {plant.name}
                              </p>
                              <p className="text-[11px] text-zinc-500">
                                {plant.type} · Status: {plant.status}
                              </p>
                            </div>
                            <Link
                              to={`/plants/${plant._id || plant.id}`}
                              className="text-[11px] text-blue-600 hover:text-blue-700"
                            >
                              Details
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-zinc-500 dark:text-zinc-400">
                <Wrench className="mx-auto mb-3 text-amber-500" size={32} />
                <p className="font-medium">
                  Select an alert from the left to start troubleshooting.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Troubleshooting;