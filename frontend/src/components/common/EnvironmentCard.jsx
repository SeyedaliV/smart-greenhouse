import { Droplets, Lightbulb, Shovel, Thermometer } from "lucide-react";

const EnvironmentCard = ({ type, value, unit, status = 'normal' }) => {
  const statusConfig = {
    normal: { color: 'text-green-500', bg: 'bg-green-100' },
    warning: { color: 'text-yellow-500', bg: 'bg-yellow-100' },
    danger: { color: 'text-red-500', bg: 'bg-red-100' }
  };

  const icons = {
    temperature: <div className="size-9 rounded-md bg-red-50 flex justify-center items-center">
    <Thermometer className="text-red-500" /></div>,
    humidity: <div className="size-9 rounded-md bg-blue-50 flex justify-center items-center">
    <Droplets className="text-blue-500" /></div>, 
    light: <div className="size-9 rounded-md bg-yellow-50 flex justify-center items-center">
    <Lightbulb className="text-yellow-500" /></div>,
    soilMoisture: <div className="size-9 rounded-md bg-amber-50 flex justify-center items-center">
    <Shovel className="text-amber-700" /></div>
  };

  const config = statusConfig[status];

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex justify-between">
        <div>
          <div className="text-2xl mb-2">{icons[type]}</div>
          <h3 className="text-sm font-medium text-gray-600 capitalize">{type}</h3>
          <p className="text-2xl font-bold text-gray-900">
            {value} <span className="text-sm text-gray-500">{unit}</span>
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