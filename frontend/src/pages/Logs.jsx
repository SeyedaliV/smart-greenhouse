import { useEffect, useState } from 'react';
import { logsService } from '../services/api';
import Loading from '../components/common/Loading';
import { Clock, Activity, Filter, User, Database, Trash2 } from 'lucide-react';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionType, setActionType] = useState('');
  const [entityType, setEntityType] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (actionType) params.actionType = actionType;
      if (entityType) params.entityType = entityType;
      const res = await logsService.getAll(params);
      setLogs(res.data.logs || res.logs || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = async () => {
    await fetchLogs();
  };

  const handleDeleteAllLogs = async () => {
    if (!confirm('Are you sure you want to delete all logs? This action cannot be undone.')) {
      return;
    }

    try {
      await logsService.deleteAll();
      await fetchLogs(); // Refresh the logs list
      alert('All logs have been deleted successfully.');
    } catch (error) {
      console.error('Error deleting logs:', error);
      alert('Error deleting logs: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Activity className="text-red-500" />
            System Logs
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300">
            Audit trail of all important actions in your smart greenhouse.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Clock size={16} />
          <span>Last {logs.length} events</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
          <Filter size={16} />
          Filters
        </div>

        <select
          value={actionType}
          onChange={(e) => setActionType(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-200"
        >
          <option value="">All actions</option>
          <option value="DEVICE_CONTROL">Device control</option>
          <option value="PLANT_CREATE">Plant create</option>
          <option value="PLANT_UPDATE">Plant update</option>
          <option value="PLANT_DELETE">Plant delete</option>
          <option value="ZONE_CREATE">Zone create</option>
          <option value="ZONE_UPDATE">Zone update</option>
          <option value="ZONE_DELETE">Zone delete</option>
          <option value="SENSOR_CREATE">Sensor create</option>
          <option value="SENSOR_UPDATE">Sensor update</option>
          <option value="SENSOR_DELETE">Sensor delete</option>
          <option value="SENSOR_READING">Sensor reading</option>
          <option value="SENSOR_CONNECTION">Sensor connection</option>
          <option value="ALERT_RESOLVE">Alert resolve</option>
          <option value="ALERT_ACK">Alert acknowledge</option>
          <option value="SEED_RUN">Seed run</option>
          <option value="SYSTEM_MAINTENANCE">System maintenance</option>
          <option value="LOGIN">Login</option>
        </select>

        <select
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-200"
        >
          <option value="">All entities</option>
          <option value="Device">Device</option>
          <option value="Plant">Plant</option>
          <option value="Zone">Zone</option>
          <option value="Sensor">Sensor</option>
          <option value="Alert">Alert</option>
          <option value="System">System</option>
          <option value="AuditLog">AuditLog</option>
        </select>

        <button
          onClick={handleFilterChange}
          className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
        >
          Apply
        </button>

        <button
          onClick={handleDeleteAllLogs}
          className="flex items-center ml-auto gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600"
        >
          <Trash2 size={14} />
          Delete All Logs
        </button>
      </div>

      {/* Logs table (styled similar to PlantTable) */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Entity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
            {logs.map((log) => (
              <tr
                key={log._id}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
              >
                <td className="px-6 py-3 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-200">
                  {log.createdAt
                    ? new Date(log.createdAt).toLocaleString()
                    : '-'}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-zinc-800 dark:text-zinc-100">
                  <div className="flex items-center gap-1.5">
                    <Activity size={14} className="text-amber-500" />
                    <span>{log.actionType}</span>
                  </div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-zinc-800 dark:text-zinc-100">
                  <div className="flex items-center gap-1.5">
                    <Database size={14} className="text-blue-500" />
                    <span>
                      {log.entityType}
                      {log.entityName ? ` · ${typeof log.entityName === 'string' ? log.entityName : (log.entityName.name || JSON.stringify(log.entityName))}` : ''}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-200">
                  <div className="flex items-center gap-1.5">
                    <User size={14} className="text-zinc-500" />
                    <span>{log.username || 'System'}</span>
                  </div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-300 max-w-md">
                  {typeof log.description === 'string' ? log.description : JSON.stringify(log.description)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-zinc-400 text-6xl mb-4">📜</div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
              No logs found
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              Actions will appear here as you interact with the system.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logs;
