import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

const SensorDeleteModal = ({ sensor, onClose, onConfirm }) => {
  if (!sensor) return null;

  const typeLabels = {
    temperature: 'Temperature',
    humidity: 'Humidity',
    soilMoisture: 'Soil Moisture',
    light: 'Light'
  };

  const typeLabel = typeLabels[sensor.type] || sensor.type;

  return (
    <div className="fixed inset-0 backdrop-brightness-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-full max-w-md border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={18} />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Delete Sensor
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3 text-sm">
          <p className="text-zinc-700 dark:text-zinc-200">
            Are you sure you want to delete this sensor? This action cannot be undone.
          </p>

          <div className="mt-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700 p-3 text-xs">
            <div className="font-medium text-zinc-900 dark:text-white mb-1">
              {sensor.name || `${typeLabel} Sensor`}
            </div>
            <div className="text-zinc-600 dark:text-zinc-300">
              <span className="font-medium">Type:</span> {typeLabel}
            </div>
            {sensor.plant && (
              <div className="text-zinc-600 dark:text-zinc-300">
                <span className="font-medium">Plant:</span>{' '}
                {sensor.plant.name || 'Unknown plant'}
              </div>
            )}
            {!sensor.plant && (
              <div className="text-zinc-600 dark:text-zinc-300">
                <span className="font-medium">Scope:</span> General zone sensor
              </div>
            )}
            {sensor.hardwareId && (
              <div className="text-zinc-600 dark:text-zinc-300">
                <span className="font-medium">Hardware ID:</span>{' '}
                {sensor.hardwareId}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-900/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-1 px-4 py-2 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default SensorDeleteModal;


