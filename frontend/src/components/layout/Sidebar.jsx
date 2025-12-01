import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import { 
  Home, 
  Leaf, 
  Settings, 
  LogOut,
  LayoutGrid,
  Cog,
  AlertOctagon,
  Activity
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/zones', icon: LayoutGrid, label: 'Zones' },
    { path: '/plants', icon: Leaf, label: 'Plants' },
    { path: '/devices', icon: Cog, label: 'Devices' },
    { path: '/troubleshooting', icon: AlertOctagon, label: 'Troubleshooting' },
    { path: '/logs', icon: Activity, label: 'Logs' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-16 lg:w-16 h-screen border-r bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 flex flex-col items-center pb-4 pt-0 fixed left-0 top-0 z-40">
  
      {/* User account */}
      <div className="flex w-16 h-16 justify-center px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 flex-col items-center mb-3">
        <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full text-sm font-bold">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        {/* <div className="text-xs text-zinc-500 text-center hidden lg:block">
          {user?.username}
        </div> */}
      </div>

      <div>
        {/* Navigation Icons */}
        <nav className="flex flex-col gap-3 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`p-3 rounded-xl transition-all duration-200 group relative ${
                  active 
                    ? 'bg-green-500 text-white shadow-lg' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-500 hover:bg-green-50 dark:hover:bg-zinc-700'
                }`}
              >
                <Icon size={20} />
              </Link>
            );
          })}
        </nav>
      </div>

      <div className='w-full h-full'></div>

      {/* Bottom Controls */}
      <div className="flex flex-col gap-3 items-center">
        {/* Settings */}
        <button 
          className="p-3 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-zinc-700 transition-all duration-200"
        >
          <Settings size={20} />
        </button>

        {/* Dark Mode Toggle */}
        <ThemeToggle />

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="p-3 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-zinc-700 transition-all duration-200"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;