const StatCard = ({ title, value, subtitle, icon, color = 'green' }) => {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500', 
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div className="bg-white rounded-xl border-gray-200 p-6 border">
      <div className="flex items-center">
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <span className="text-white text-xl">{icon}</span>
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default StatCard;