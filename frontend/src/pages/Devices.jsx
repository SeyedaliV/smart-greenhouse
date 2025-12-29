import { useState, useEffect } from 'react';
import DeviceCard from '../components/devices/DeviceCard';
import DeviceForm from '../components/devices/DeviceForm';
import PowerConsumption from '../components/devices/PowerConsumption';
import { devicesService, zonesService } from '../services/api';
import Loading from '../components/common/Loading';
import { Power } from 'lucide-react';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedZone, setSelectedZone] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredDevices = selectedZone === 'All' 
  ? devices 
  : devices.filter(device => device.zone?.name === selectedZone || device.zone === selectedZone);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [devicesData, zonesData] = await Promise.all([
        devicesService.getAll(),
        zonesService.getAll()
      ]);
      console.log('📦 Devices API response:', devicesData); // برای دیباگ
      console.log('📦 Zones API response:', zonesData); // برای دیباگ
      setDevices(devicesData.data.devices);
      setZones(zonesData);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    try {
      const data = await devicesService.getAll();
      console.log('📦 Devices API response:', data); // برای دیباگ
      setDevices(data.data.devices);
    } catch (err) {
      setError('Failed to load devices');
      console.error('Error fetching devices:', err);
    }
  };

  const handleDeviceControl = async (deviceId, newStatus) => {
    try {
      console.log('🔧 Controlling device:', deviceId, '→', newStatus);
      await devicesService.control(deviceId, { status: newStatus });

      // آپدیت local state
      setDevices(prevDevices =>
        prevDevices.map(device =>
          (device.id === deviceId || device._id === deviceId)
            ? { ...device, status: newStatus, lastAction: new Date() }
            : device
        )
      );
    } catch (error) {
      console.error('❌ Error controlling device:', error);
      alert('Failed to control device: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddDevice = (newDevice) => {
    setDevices(prevDevices => [...prevDevices, newDevice]);
    setShowAddModal(false);
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!confirm('Are you sure you want to delete this device?')) return;

    try {
      await devicesService.delete(deviceId);
      setDevices(prevDevices => prevDevices.filter(device =>
        device.id !== deviceId && device._id !== deviceId
      ));
    } catch (error) {
      console.error('❌ Error deleting device:', error);
      alert('Failed to delete device: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <Loading />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
    {/* هدر صفحه */}
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Power className="text-blue-500" />
          System Logs
        </h1>
        <p className="text-zinc-600 dark:text-zinc-300">Manage and control your greenhouse devices</p>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200 font-medium"
        >
          Add Device
        </button>

        {/* فیلتر Zone */}
        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="px-3 text-zinc-700 dark:text-zinc-200 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
        >
          <option value="All">All Zones</option>
          {zones.map(zone => (
            <option key={zone._id} value={zone.name}>
              {zone.name} - {zone.description}
            </option>
          ))}
        </select>

        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          {filteredDevices.filter(d => d.status === 'ON').length} devices active
        </div>
      </div>
    </div>
    

    {/* آمار مصرف برق */}
    <PowerConsumption devices={devices} />

    {/* شبکه دستگاه‌ها */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {filteredDevices.map((device, index) => (
        <DeviceCard
          key={device.id || device._id || `device-${index}`}
          device={device}
          onControl={handleDeviceControl}
          onDelete={handleDeleteDevice}
        />
      ))}
    </div>

    {/* پیام خالی */}
    {devices.length === 0 && (
      <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-xl border dark:border-zinc-700">
        <div className="text-zinc-400 text-6xl mb-4">🔧</div>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">No devices configured</h3>
        <p className="text-zinc-500 dark:text-zinc-400">Devices will appear here when added to the system</p>
      </div>
    )}

    {/* Add Device Modal */}
    {showAddModal && (
      <DeviceForm
        onClose={() => setShowAddModal(false)}
        onSave={handleAddDevice}
        zones={zones}
      />
    )}
  </div>
  );
};

export default Devices;
