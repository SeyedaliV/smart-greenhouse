import { useState, useEffect } from 'react';
import { zonesService } from '../services/api';
import ZoneCard from '../components/zones/ZoneCard';
import Loading from '../components/common/Loading';

const Zones = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const zonesData = await zonesService.getAll();
      setZones(zonesData);
    } catch (error) {
      console.error('Error fetching zones:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Greenhouse Zones</h1>
          <p className="text-gray-600">Manage and monitor all zones</p>
        </div>
        <div className="text-sm text-gray-500">
          {zones.length} zones total
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zones.map((zone) => (
          <ZoneCard key={zone._id} zone={zone} />
        ))}
      </div>
    </div>
  );
};

export default Zones;