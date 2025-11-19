import { Droplets, Sprout, Sun, Thermometer, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getHarvestStatus } from '../../utils/plantCalculations';

const PlantTable = ({ plants, onEdit, onDelete, showZone = false }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      optimal: { color: 'bg-green-100 text-green-800', text: 'Optimal' },
      needs_attention: { color: 'bg-yellow-100 text-yellow-800', text: 'Needs Attention' },
      critical: { color: 'bg-red-100 text-red-800', text: 'Critical' }
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
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Plant
            </th>
            {showZone && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Zone
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Current Stats
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Days to Harvest
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {plants.map((plant, index) => {
            const plantIdentifier = plant._id || plant.id || `plant-${index}`;
            const harvestStatus = getHarvestStatus(plant.daysUntilHarvest);

            return (
              <tr key={plantIdentifier} className="hover:bg-gray-50">
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {plant.name}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {plant.type}
                      </div>
                    </div>
                  </div>
                </td>
                {showZone && (
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin size={16} className="text-gray-400 mr-1" />
                      {plant.zone?.name || 'No Zone'}
                    </div>
                  </td>
                )}
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className="text-sm grid grid-cols-2 text-gray-900 space-y-1">
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
                  <div className="text-sm text-gray-500">
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
                      className="text-green-600 px-2 py-1 rounded-md bg-green-100 hover:text-green-900"
                    >
                      Plant Details
                    </Link>
                    <button
                      onClick={() => onEdit(plant)}
                      className="text-blue-600 px-2 py-1 rounded-md bg-blue-100 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(plantIdentifier)}
                      className="text-red-600 px-2 py-1 rounded-md bg-red-100 hover:text-red-900"
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
          <div className="text-gray-400 text-6xl mb-4">🌱</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No plants found</h3>
          <p className="text-gray-500">No plants match your current filter</p>
        </div>
      )}
    </div>
  );
};

export default PlantTable;