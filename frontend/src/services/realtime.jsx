import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { AlertTriangle, Bell, CheckCircle, PlugZap, WifiOff, X, BatteryCharging } from 'lucide-react';

const SOCKET_URL = 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket'],
});

let initialized = false;

const iconByTone = {
  success: <CheckCircle className="text-green-600 dark:text-green-400" size={18} />,
  warning: <AlertTriangle className="text-amber-600 dark:text-amber-400" size={18} />,
  info: <Bell className="text-blue-600 dark:text-blue-400" size={18} />,
  offline: <WifiOff className="text-red-600 dark:text-red-400" size={18} />,
  auto: <PlugZap className="text-purple-600 dark:text-purple-400" size={18} />,
  battery: <BatteryCharging className="text-rose-600 dark:text-rose-400" size={18} />,
};

const showToast = ({
  id,
  title,
  description,
  tone = 'info',
}) => {
  toast.custom(
    (t) => (
      <div
        className={`pointer-events-auto w-80 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg p-3 flex gap-3 items-start ${
          t.visible ? 'animate-in fade-in slide-in-from-top-2' : 'animate-out fade-out'
        }`}
      >
        <div className="mt-0.5">{iconByTone[tone] || iconByTone.info}</div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</div>
          {description && (
            <div className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-snug">{description}</div>
          )}
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="size-5 rounded flex justify-center duration-75 items-center hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          aria-label="Close toast"
        >
          <X size={16} />
        </button>
      </div>
    ),
    {
      id,
      duration: Infinity,
    },
  );
};

export const initRealtimeListeners = () => {
  if (initialized) return;
  initialized = true;

  socket.on('connect', () => {
    showToast({
      id: 'socket-connect',
      title: 'Connected to greenhouse simulation',
      description: 'Live data streaming is active.',
      tone: 'success',
    });
  });

  socket.on('disconnect', () => {
    showToast({
      id: 'socket-disconnect',
      title: 'Disconnected from simulation server',
      description: 'Check backend availability or network.',
      tone: 'offline',
    });
  });

  socket.on('automation:event', (event) => {
    const title = `AUTO: ${event.deviceName} → ${event.newStatus}`;
    const zoneText = event.zone ? `Zone: ${event.zone}` : '';
    const metricText =
      event.metric && event.metricValue
        ? `${event.metric}: ${event.metricValue} (target ${event.targetRange})`
        : '';

    showToast({
      title,
      description: [zoneText, metricText].filter(Boolean).join(' • '),
      tone: 'auto',
    });
  });

  socket.on('alerts:new', (alert) => {
    showToast({
      title: alert.message,
      description: alert.action,
      tone: alert.type === 'critical' ? 'warning' : 'info',
    });
  });

  socket.on('alerts:resolved', (alert) => {
    showToast({
      title: 'Issue resolved',
      description: alert.message,
      tone: 'success',
    });
  });

  socket.on('sensor:batteryEmpty', (payload) => {
    showToast({
      title: 'Sensor battery depleted',
      description: payload.name,
      tone: 'battery',
    });
  });
};


