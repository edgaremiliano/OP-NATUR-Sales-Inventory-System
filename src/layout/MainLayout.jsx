import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { LayoutDashboard, Package, LogOut, Hexagon, History as HistoryIcon } from 'lucide-react';

export default function MainLayout() {
  const { user, logout } = useAppContext();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/history', label: 'Historial', icon: <HistoryIcon size={20} /> },
    { path: '/inventory', label: 'Inventario', icon: <Package size={20} /> },
  ];

  return (
    <div className="flex bg-chocolate-900 min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-chocolate-800 bg-chocolate-900/50 backdrop-blur-md flex flex-col">
        <div className="p-8 flex items-center gap-3">
          <Hexagon className="text-gold-400 w-8 h-8" />
          <span className="text-xl font-light tracking-widest text-beige-50">SALES</span>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-chocolate-800 text-gold-400 shadow-md border border-chocolate-700' : 'text-chocolate-500 hover:text-beige-50 hover:bg-chocolate-800/50'}`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-chocolate-800">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-chocolate-500 hover:text-red-400 hover:bg-chocolate-800/50 transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto h-screen relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/5 rounded-full blur-[100px] pointer-events-none"></div>
        <Outlet />
      </main>
    </div>
  );
}