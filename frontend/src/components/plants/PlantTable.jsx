import { Droplets, Sprout, Sun, Thermometer, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getHarvestStatus } from '../../utils/plantCalculations';

const PlantTable = ({ plants, onEdit, onDelete, showZone = false }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      optimal: { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', text: 'Optimal' },
      needs_attention: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', text: 'Needs Attention' },
      critical: { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', text: 'Critical' }
    };

    const config = statusConfig[status] || statusConfig.optimal;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
        <thead className="bg-zinc-50 dark:bg-zinc-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Plant
            </th>
            {showZone && (
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Zone
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Current Stats
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Days to Harvest
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
          {plants.map((plant, index) => {
            const plantIdentifier = plant._id || plant.id || `plant-${index}`;
            const harvestStatus = getHarvestStatus(plant.daysUntilHarvest);

            return (
              <tr key={plantIdentifier} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-white">
                        {plant.name}
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400 capitalize">
                        {plant.type}
                      </div>
                    </div>
                  </div>
                </td>
                {showZone && (
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center text-sm text-zinc-900 dark:text-white">
                      <MapPin size={16} className="text-zinc-400 dark:text-zinc-500 mr-1" />
                      {plant.zone?.name || 'No Zone'}
                    </div>
                  </td>
                )}
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className="text-sm grid grid-cols-2 text-zinc-900 dark:text-white space-y-1">
                    <div className='flex'><Thermometer size={20} className="text-red-500 mr-1.5" />
                    {plant.currentStats?.temperature || 0}°C</div>
                    <div className='flex'><Droplets size={20} className="text-blue-500 mr-1.5" />
                    {plant.currentStats?.humidity || 0}% air</div>
                    <div className='flex'><Sprout size={20} className="text-green-500 mr-1.5" />
                    {plant.currentStats?.soilMoisture || 0}% soil</div>
                    <div className='flex'><Sun size={20} className="text-yellow-500 mr-1.5" />
                    {plant.currentStats?.light || 0} lux</div>
                  </div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className={`text-sm font-medium ${harvestStatus.color}`}>
                    {harvestStatus.text}
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    {plant.estimatedHarvestDate ? new Date(plant.estimatedHarvestDate).toLocaleDateString() : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap">
                  {getStatusBadge(plant.status)}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-1">
                    <Link
                      to={`/plants/${plant._id || plant.id}`}
                      className="text-green-600 dark:text-green-500 px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 hover:text-green-900 dark:hover:text-green-300"
                    >
                      Plant Details
                    </Link>
                    <button
                      onClick={() => onEdit(plant)}
                      className="text-blue-600 dark:text-blue-500 px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 hover:text-blue-900 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(plant)}
                      className="text-red-600 dark:text-red-500 px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 hover:text-red-900 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {plants.length === 0 && (
        <div className="text-center py-12">
          <div className="text-zinc-400 text-6xl mb-4">🌱</div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">No plants found</h3>
          <p className="text-zinc-500 dark:text-zinc-400">No plants match your current filter</p>
        </div>
      )}
    </div>
  );
};

export default PlantTable;
