import { Droplets, Lightbulb, Shovel, Thermometer } from "lucide-react";

const EnvironmentCard = ({ type, value, unit, status = 'normal' }) => {
  const statusConfig = {
    normal: { color: 'text-green-500 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
    warning: { color: 'text-yellow-500 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    danger: { color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' }
  };

  const icons = {
    temperature: <div className="size-9 rounded-md bg-red-50 dark:bg-red-900/20 flex justify-center items-center">
    <Thermometer className="text-red-500" /></div>,
    humidity: <div className="size-9 rounded-md bg-blue-50 dark:bg-blue-900/20 flex justify-center items-center">
    <Droplets className="text-blue-500" /></div>, 
    light: <div className="size-9 rounded-md bg-yellow-50 dark:bg-yellow-900/20 flex justify-center items-center">
    <Lightbulb className="text-yellow-500" /></div>,
    soilMoisture: <div className="size-9 rounded-md bg-amber-50 dark:bg-amber-900/20 flex justify-center items-center">
    <Shovel className="text-amber-700 dark:text-amber-500" /></div>
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
          {status}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentCard;