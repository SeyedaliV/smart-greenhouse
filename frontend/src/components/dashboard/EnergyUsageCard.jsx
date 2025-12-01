// components/dashboard/EnergyUsageCard.jsx
import { Zap, Power, DollarSign, BarChart3 } from 'lucide-react';

const EnergyUsageCard = ({ energyUsage }) => {
  const defaultEnergyUsage = {
    totalPower: 0,
    activeDevices: 0,
    hourlyCost: 0,
    dailyCost: 0
  };

  const data = energyUsage || defaultEnergyUsage;

  const formatCost = (cost) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cost);
  };

  const calculateEfficiency = () => {
    const maxPower = 5000; // 5kW assumed max capacity
    const efficiency = (data.totalPower / maxPower) * 100;
    return Math.min(efficiency, 100);
  };

  const efficiency = calculateEfficiency();

  const getEfficiencyColor = (eff) => {
    if (eff <= 30) return 'text-green-600';
    if (eff <= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyStatus = (eff) => {
    if (eff <= 30) return 'Efficient';
    if (eff <= 70) return 'Moderate';
    return 'High Usage';
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Energy Usage</h2>
            <p className="text-sm text-zinc-600">Power consumption and costs</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <Power size={18} className="text-blue-600" />
            <div className="text-xl font-bold text-blue-600">
              {data.totalPower}W
            </div>
          </div>
          <div className="text-sm text-blue-700 font-medium">Total Power</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <Zap size={18} className="text-green-600" />
            <div className="text-xl font-bold text-green-600">
              {data.activeDevices}
            </div>
          </div>
          <div className="text-sm text-green-700 font-medium">Active Devices</div>
        </div>
        
        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <DollarSign size={18} className="text-orange-600" />
            <div className="text-xl font-bold text-orange-600">
              {formatCost(data.hourlyCost)}
            </div>
          </div>
          <div className="text-sm text-orange-700 font-medium">Hourly Cost</div>
        </div>
        
        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <DollarSign size={18} className="text-red-600" />
            <div className="text-xl font-bold text-red-600">
              {formatCost(data.dailyCost)}
            </div>
          </div>
          <div className="text-sm text-red-700 font-medium">Daily Cost</div>
        </div>
      </div>

      {/* Efficiency Meter */}
      <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <BarChart3 size={18} className="text-zinc-600" />
            <span className="text-sm font-medium text-zinc-900">Energy Efficiency</span>
          </div>
          <div className={`text-sm font-bold ${getEfficiencyColor(efficiency)}`}>
            {getEfficiencyStatus(efficiency)}
          </div>
        </div>
        
        <div className="w-full bg-zinc-200 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              efficiency <= 30 ? 'bg-green-500' :
              efficiency <= 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${efficiency}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-zinc-600">
          <span>0%</span>
          <span>{Math.round(efficiency)}% Capacity</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default EnergyUsageCard;