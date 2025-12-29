const StatCard = ({ title, value, subtitle, icon, color = 'green' }) => {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500', 
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500'
  };

  return (
    <div className="bg-whit grow dark:bg-zinc-800 rounded-xl border-zinc-200 dark:border-zinc-700 p-6 border">
      <div className="flex items-center">
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <span className="text-white text-xl">{icon}</span>
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-zinc-600 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-sm text-zinc-500 dark:text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default StatCard;