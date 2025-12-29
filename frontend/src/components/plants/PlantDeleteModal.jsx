import { AlertTriangle, Trash2 } from 'lucide-react';

const PlantDeleteModal = ({ plant, onClose, onConfirm }) => {
  if (!plant) return null;

  return (
    <div className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="shrink-0">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Delete Plant
              </h3>
              <p className="text-sm text-zinc-600 dark:text-gray-400">
                This action cannot be undone
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-zinc-700 dark:text-gray-300 mb-3">
              Are you sure you want to delete <strong>{plant.name}</strong>? This will permanently delete:
            </p>
            <ul className="text-sm text-zinc-600 dark:text-gray-400 space-y-1 ml-4">
              <li>• The plant record</li>
              <li>• All associated sensor data</li>
              <li>• Growth tracking information</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200 flex items-center justify-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Delete Plant</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDeleteModal;
