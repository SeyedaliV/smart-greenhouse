// components/dashboard/AlertsCard.jsx
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, AlertCircle, Info, ArrowRight } from 'lucide-react';

const AlertsCard = ({ alerts, onResolve, onAcknowledge }) => {
  const navigate = useNavigate();
  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertCircle size={20} className="text-red-600 dark:text-red-500" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-500" />;
      default:
        return <Info size={20} className="text-blue-600 dark:text-blue-500" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'critical':
        return 'text-red-800 dark:text-red-300';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-300';
      default:
        return 'text-blue-800 dark:text-blue-300';
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-800 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 dark:bg-green-700 rounded-lg flex items-center justify-center">
              <AlertCircle size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Alerts</h2>
              <p className="text-sm text-zinc-600 dark:text-gray-400">System notifications and warnings</p>
            </div>
          </div>
        </div>
        
        <div className="text-center py-8">
          <div className="text-zinc-400 mb-2">
            <AlertCircle size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-1">No Alerts</h3>
          <p className="text-zinc-500 dark:text-gray-400">All systems are operating normally</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-800 w-full h-60 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-600 dark:bg-orange-700 rounded-lg flex items-center justify-center">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Alerts</h2>
            <p className="text-sm text-zinc-600 dark:text-gray-400">System notifications and warnings</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-zinc-600 dark:text-gray-400">{alerts.length} alerts</span>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.slice(0, 5).map((alert, index) => (
          <div
            key={index}
            onClick={() => navigate(`/troubleshooting?alertIndex=${index}`)}
            className={`p-4 rounded-lg border cursor-pointer hover:shadow-sm dark:hover:shadow-zinc-900 transition-shadow ${getAlertColor(alert.type)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="shrink-0 mt-0.5">
                {getAlertIcon(alert.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`text-sm font-semibold ${getTextColor(alert.type)} mb-1`}>
                      {alert.message}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-gray-400">
                      {alert.action}
                    </p>
                  </div>
                  
                  {alert.value && (
                    <div className="text-sm font-medium text-zinc-900 dark:text-white bg-white dark:bg-zinc-700 px-2 py-1 rounded border dark:border-zinc-600">
                      {alert.value}
                    </div>
                  )}
                </div>
                
                {alert.count && (
                  <div className="mt-2 text-xs text-zinc-500 dark:text-gray-500">
                    Affected: {alert.count} items
                  </div>
                )}

                <div className="mt-3 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAcknowledge && onAcknowledge(index);
                    }}
                    className="text-xs px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-gray-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                  >
                    Acknowledge
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResolve && onResolve(index);
                    }}
                    className="text-xs px-2 py-1 rounded bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {alerts.length > 5 && (
        <div className="mt-4 pt-4 sticky border-t border-zinc-200 dark:border-zinc-700">
          <button className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400 font-medium">
            <span>View all {alerts.length} alerts</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertsCard;