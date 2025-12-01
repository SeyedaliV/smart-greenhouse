import { useState, useEffect } from 'react';
import DeviceCard from '../components/devices/DeviceCard';
import PowerConsumption from '../components/devices/PowerConsumption';
import { devicesService } from '../services/api';
import Loading from '../components/common/Loading';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedZone, setSelectedZone] = useState('All');

  const filteredDevices = selectedZone === 'All' 
  ? devices 
  : devices.filter(device => device.zone === selectedZone);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const data = await devicesService.getAll();
      console.log('📦 Devices API response:', data); // برای دیباگ
      setDevices(data.data.devices);
    } catch (err) {
      setError('Failed to load devices');
      console.error('Error fetching devices:', err);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Devices Control</h1>
        <p className="text-zinc-600 dark:text-zinc-300">Manage and control your greenhouse devices</p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* فیلتر Zone */}
        <select 
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="px-3 text-zinc-700 dark:text-zinc-200 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
        >
          <option value="All">All Zones</option>
          <option value="Zone A">Zone A</option>
          <option value="Zone B">Zone B</option>
          <option value="Zone C">Zone C</option>
          <option value="Zone D">Zone D</option>
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
  </div>
  );
};

export default Devices;