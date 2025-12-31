const PowerConsumption = ({ devices }) => {
  const calculatePowerStats = () => {
    const activeDevices = devices.filter(device => device.status === 'ON');
    const totalPower = activeDevices.reduce((sum, device) => 
      sum + (device.powerConsumption || 0), 0
    );

    const hourlyCost = (totalPower * 0.2) / 1000;
    const dailyCost = hourlyCost * 24;
    const monthlyCost = dailyCost * 30;

    return {
      totalPower,
      activeDevices: activeDevices.length,
      hourlyCost,
      dailyCost,
      monthlyCost
    };
  };

  const stats = calculatePowerStats();

  const formatCost = (cost) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cost);
  };

  return (
    <div className="bg-linear-to-r from-blue-500 to-blue-600 dark:from-blue-800 dark:to-blue-900 rounded-xl shadow-lg text-white p-6">
      <h2 className="text-xl font-semibold mb-4">Power Consumption</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{stats.totalPower}W</div>
          <div className="text-blue-100 dark:text-blue-200 text-sm">Total Power</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold">{stats.activeDevices}</div>
          <div className="text-blue-100 dark:text-blue-200 text-sm">Active Devices</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold">{formatCost(stats.dailyCost)}</div>
          <div className="text-blue-100 dark:text-blue-200 text-sm">Daily Cost</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold">{formatCost(stats.monthlyCost)}</div>
          <div className="text-blue-100 dark:text-blue-200 text-sm">Monthly Cost</div>
        </div>
      </div>

      {/* consumption progressbar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-blue-200 dark:text-blue-300 mb-1">
          <span>Power Usage</span>
          <span>{stats.totalPower}W / 5000W</span>
        </div>
        <div className="w-full bg-blue-400 dark:bg-blue-950 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{ width: `${Math.min((stats.totalPower / 5000) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default PowerConsumption;