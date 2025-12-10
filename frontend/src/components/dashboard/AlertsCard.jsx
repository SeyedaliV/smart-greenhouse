// components/dashboard/AlertsCard.jsx
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, AlertCircle, Info, ArrowRight } from 'lucide-react';

const AlertsCard = ({ alerts, onResolve, onAcknowledge }) => {
  const navigate = useNavigate();
  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-600" />;
      default:
        return <Info size={20} className="text-blue-600" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'critical':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-blue-800';
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white w-full rounded-xl border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <AlertCircle size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Alerts</h2>
              <p className="text-sm text-zinc-600">System notifications and warnings</p>
            </div>
          </div>
        </div>
        
        <div className="text-center py-8">
          <div className="text-zinc-400 mb-2">
            <AlertCircle size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900 mb-1">No Alerts</h3>
          <p className="text-zinc-500">All systems are operating normally</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full h-60 overflow-y-auto rounded-xl border border-zinc-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Alerts</h2>
            <p className="text-sm text-zinc-600">System notifications and warnings</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-zinc-600">{alerts.length} alerts</span>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.slice(0, 5).map((alert, index) => (
          <div
            key={index}
            onClick={() => navigate(`/troubleshooting?alertIndex=${index}`)}
            className={`p-4 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${getAlertColor(alert.type)}`}
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
                    <p className="text-sm text-zinc-600">
                      {alert.action}
                    </p>
                  </div>
                  
                  {alert.value && (
                    <div className="text-sm font-medium text-zinc-900 bg-white px-2 py-1 rounded border">
                      {alert.value}
                    </div>
                  )}
                </div>
                
                {alert.count && (
                  <div className="mt-2 text-xs text-zinc-500">
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
                    className="text-xs px-2 py-1 rounded border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                  >
                    Acknowledge
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResolve && onResolve(index);
                    }}
                    className="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700"
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
        <div className="mt-4 pt-4 sticky border-t border-zinc-200">
          <button className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
            <span>View all {alerts.length} alerts</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertsCard;