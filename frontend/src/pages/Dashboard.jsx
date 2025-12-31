import { useState, useEffect } from 'react';
import StatCard from '../components/common/StatCard';
import EnvironmentCard from '../components/common/EnvironmentCard';
import PlantStatusCard from '../components/plants/PlantStatusCard';
import AlertsCard from '../components/dashboard/AlertsCard';
import { dashboardService } from '../services/api';
import { Leaf, TriangleAlert, Smile, Gauge, LayoutGrid, Power } from 'lucide-react';
import Loading from '../components/common/Loading';
import { socket } from '../services/realtime';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Live alerts from socket.io
    const handleAlertsUpdate = (serverAlerts) => {
      setAlerts(serverAlerts || []);
    };

    socket.on('alerts:update', handleAlertsUpdate);

    return () => {
      socket.off('alerts:update', handleAlertsUpdate);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await dashboardService.getDashboard();
      console.log('Dashboard API Response:', data);
      
      if (data && data.data) {
        setDashboardData(data.data);
        setAlerts(data.data.alerts || []);
      } else {
        throw new Error('Invalid data format from server');
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">{error}</h3>
          <button 
            onClick={fetchDashboardData}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="text-center py-12">
        <div className="text-zinc-400 text-6xl mb-4">🌱</div>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">No data available</h3>
        <p className="text-zinc-500 dark:text-zinc-400">Please make sure the backend is running and has data.</p>
      </div>
    );
  }

  const { overview, environment, plants = [], devices = [] } = dashboardData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Overview of your smart greenhouse</p>
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="flex gap-6">
        <StatCard
          title="Total Plants"
          value={overview.totalPlants || 0}
          icon={<Leaf size={28} className="text-white" />}
          color="green"
        />

        <StatCard
          title="Active Devices"
          value={overview.activeDevices || 0}
          icon={<Power size={28} className="text-white" />}
          color="blue"
        />

        <StatCard
          title="Total Zones"
          value={overview.totalZones || 0}
          icon={<LayoutGrid size={28} className="text-white" />}
          color="purple"
        />

        <StatCard
          title="Total Sensors"
          value={overview.totalSensors || 0}
          icon={<Gauge size={28} className="text-white" />}
          color="indigo"
        />

        <StatCard
          title="Needs Attention"
          value={overview.needsAttentionPlants || 0}
          icon={<TriangleAlert size={28} className="text-white" />}
          color="yellow"
        />

        <StatCard
          title="Optimal Plants"
          value={overview.optimalPlants || 0}
          icon={<Smile size={28} className="text-white" />}
          color="emerald"
        />
      </div>

      <div className="gap-6">
        {/* <div className="lg:col-span-2">
          <AlertBanner plants={plants} />
        </div> */}
        <div>
          <AlertsCard
            alerts={alerts}
          />
        </div>
      </div>


      <div className="bg-white dark:bg-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-700">
        <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Average sensors status</h2>
          <p className="text-zinc-600 dark:text-zinc-400">Current condition of all sensors</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <EnvironmentCard
              type="temperature"
              value={environment?.temperature || 0}
              unit="°C"
              status="normal"
            />
            <EnvironmentCard
              type="humidity"
              value={environment?.humidity || 0}
              unit="%"
              status="normal"
            />
            <EnvironmentCard
              type="light"
              value={environment?.light || 0}
              unit="lux"
              status="normal"
            />
            <EnvironmentCard
              type="soilMoisture"
              value={environment?.soilMoisture || 0}
              unit="%"
              status="normal"
            />
          </div>
        </div>
      </div>


      <div className="bg-white dark:bg-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-700">
        <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Plant Status</h2>
          <p className="text-zinc-600 dark:text-zinc-400">Current condition of all plants</p>
        </div>
        <div className="p-6">
          {plants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plants.map((plant) => (
                <PlantStatusCard key={plant.id} plant={plant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-zinc-400 text-4xl mb-2">🌱</div>
              <p className="text-zinc-500 dark:text-zinc-400">No plants found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
