import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  Info,
  Sprout
} from 'lucide-react';

const AlertBanner = ({ plants = [] }) => {
  const criticalPlants = plants.filter(plant => plant.status === 'critical');
  const attentionPlants = plants.filter(plant => plant.status === 'needs_attention');

  if (criticalPlants.length === 0 && attentionPlants.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="text-green-500 mr-2" size={24} />
          <span className="text-green-800">All plants are in good condition</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start">
        <AlertTriangle className="text-amber-500 mr-2" size={24} />
        <div>
          <h3 className="text-yellow-800 font-medium mb-2">Attention Required</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            {criticalPlants.map(plant => (
              <li key={plant.id} className="flex items-center">
                <AlertCircle className="text-red-500 mr-1" size={20} />
                <span>{plant.name} needs immediate attention</span>
              </li>
            ))}
            {attentionPlants.map(plant => (
              <li key={plant.id} className="flex items-center">
                <Info className="text-yellow-500 mr-1" size={20} />
                <span>{plant.name} requires monitoring</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;