import { useState, useEffect } from 'react';
import StatCard from '../components/common/StatCard';
import EnvironmentCard from '../components/common/EnvironmentCard';
import PlantStatusCard from '../components/plants/PlantStatusCard';
import AlertBanner from '../components/common/AlertBanner';
import { dashboardService } from '../services/api';
import { Leaf, Cog, TriangleAlert, Smile } from 'lucide-react';
import Loading from '../components/common/Loading';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getAverageSoilMoisture = (plants) => {
    if (!plants || plants.length === 0) return 0;
    const total = plants.reduce((sum, plant) => sum + (plant.currentStats?.soilMoisture || 0), 0);
    return Math.round(total / plants.length);
  };

  const fetchDashboardData = async () => {
    try {
      const data = await dashboardService.getDashboard();
      console.log('Dashboard API Response:', data); // برای دیباگ
      
      if (data && data.data) {
        setDashboardData(data.data);
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

  // حالت لودینگ
  if (loading) {
    return (
      <Loading />
    );
  }

  // حالت خطا
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
          <button 
            onClick={fetchDashboardData}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // حالت داده نامعتبر
  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🌱</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
        <p className="text-gray-500">Please make sure the backend is running and has data.</p>
      </div>
    );
  }

  // حالت عادی - فقط اینجا به dashboardData.overview دسترسی داریم
  const { overview, environment, plants = [], devices = [] } = dashboardData;

  return (
    <div className="space-y-6">
      {/* هدر صفحه */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your smart greenhouse</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* کارت‌های آمار کلی */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Plants"
          value={overview.totalPlants || 0}
          icon={<Leaf size={28} className="text-white" />}
          color="green"
        />

        <StatCard
          title="Active Devices" 
          value={overview.activeDevices || 0}
          icon={<Cog size={28} className="text-white" />}
          color="blue"
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
          color="green"
        />
      </div>

      {/* هشدارها */}
      <AlertBanner plants={plants} />

      {/* وضعیت محیط */}
      

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-3 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Average sensors status</h2>
          <p className="text-gray-600">Current condition of all sensors</p>
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
              value={getAverageSoilMoisture(plants)}
              unit="%"
              status="normal"
            />
          </div>
        </div>
      </div>
      

      {/* وضعیت گیاهان */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-3 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Plant Status</h2>
          <p className="text-gray-600">Current condition of all plants</p>
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
              <div className="text-gray-400 text-4xl mb-2">🌱</div>
              <p className="text-gray-500">No plants found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;