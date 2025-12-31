import { Droplets, Sprout, Sun, Thermometer } from "lucide-react";

const EnvironmentCard = ({ type, value, unit, status }) => {
  // Calculate status based on optimal ranges if not provided
  const getStatusFromValue = (type, value) => {
    const optimalRanges = {
      temperature: { min: 20, max: 28 },
      humidity: { min: 55, max: 75 },
      soilMoisture: { min: 40, max: 60 },
      light: { min: 600, max: 900 }
    };

    const range = optimalRanges[type];
    if (!range) return 'normal';

    if (value >= range.min && value <= range.max) return 'optimal';
    if (value >= range.min - 5 && value <= range.max + 5) return 'warning';
    return 'critical';
  };

  const calculatedStatus = status || getStatusFromValue(type, value);

  const statusConfig = {
    optimal: { color: 'text-green-500 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', text: 'Optimal' },
    warning: { color: 'text-yellow-500 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'Warning' },
    critical: { color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', text: 'Critical' },
    normal: { color: 'text-green-500 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', text: 'Normal' }
  };

  const icons = {
    temperature: <div className="size-9 rounded-md bg-red-50 dark:bg-red-900/20 flex justify-center items-center">
    <Thermometer className="text-red-500" /></div>,
    humidity: <div className="size-9 rounded-md bg-blue-50 dark:bg-blue-900/20 flex justify-center items-center">
    <Droplets className="text-blue-500" /></div>, 
    light: <div className="size-9 rounded-md bg-yellow-50 dark:bg-yellow-900/20 flex justify-center items-center">
    <Sun className="text-yellow-500" /></div>,
    soilMoisture: <div className="size-9 rounded-md bg-green-50 dark:bg-green-900/20 flex justify-center items-center">
    <Sprout className="text-green-700 dark:text-green-500" /></div>
  };

  const config = statusConfig[status];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
      <div className="flex justify-between">
        <div>
          <div className="text-2xl mb-2">{icons[type]}</div>
          <h3 className="text-sm font-medium text-zinc-600 dark:text-gray-400 capitalize">{type}</h3>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {value} <span className="text-sm text-zinc-500 dark:text-gray-400">{unit}</span>
          </p>
        </div>
        <div className={`${config.bg} ${config.color} h-7 px-3 py-1 rounded-full text-sm font-medium`}>
          {config.text}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentCard;