import { useState, useEffect } from 'react';
import { zonesService } from '../services/api';
import ZoneCard from '../components/zones/ZoneCard';
import ZoneForm from '../components/zones/ZoneForm';
import Loading from '../components/common/Loading';
import { Grid, LayoutGrid } from 'lucide-react';

const Zones = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const response = await zonesService.getAll();
      const zonesData = response.data?.zones || response || [];
      setZones(zonesData);
    } catch (error) {
      console.error('Error fetching zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleZoneCreated = async () => {
    await fetchZones();
    setShowCreateModal(false);
  };

  if (loading && zones.length === 0) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <LayoutGrid className="text-purple-500" />
            Greenhouse Zones
          </h1>
          <p className="text-zinc-600 dark:text-gray-400">Manage and monitor all zones</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200 font-medium"
          >
            Create New Zone
          </button>
          <div className="text flex justify-center h-8 border border-blue-100 dark:border-blue-900 px-4 items-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            {zones.length} Zones total
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zones.map((zone) => (
          <ZoneCard key={zone._id} zone={zone} />
        ))}
      </div>

      {/* Create Zone Modal */}
      {showCreateModal && (
        <ZoneForm
          onClose={() => setShowCreateModal(false)}
          onSave={handleZoneCreated}
        />
      )}
    </div>
  );
};

export default Zones;