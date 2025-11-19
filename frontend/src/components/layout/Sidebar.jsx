import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Leaf, 
  Settings, 
  LogOut,
  Sun,
  Moon,
  LayoutGrid,
  Cog
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
    { path: '/plants', icon: Leaf, label: 'Plants' },
    { path: '/zones', icon: LayoutGrid, label: 'Zones' },
    { path: '/devices', icon: Cog, label: 'Devices' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-16 lg:w-16 h-screen border-r bg-white border-gray-200 flex flex-col items-center pb-4 pt-0 fixed left-0 top-0 z-40">
      
      {/* User account */}
      <div className="flex w-16 h-16 justify-center px-4 py-3 border-b border-gray-200 flex-col items-center mb-3">
        <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full text-sm font-bold">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        {/* <div className="text-xs text-gray-500 text-center hidden lg:block">
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
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
                title={item.label}
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
          className="p-3 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
          title="Settings"
        >
          <Settings size={20} />
        </button>

        {/* Dark Mode Toggle */}
        <button 
          className="p-3 rounded-xl text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 transition-all duration-200"
          title="Toggle Theme"
        >
          <Sun size={20} />
        </button>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="p-3 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;