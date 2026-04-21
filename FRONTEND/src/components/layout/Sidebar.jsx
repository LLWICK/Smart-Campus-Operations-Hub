import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  CalendarRange,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
  Users,
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/facilities', icon: Building2, label: 'Facilities' },
  { to: '/bookings', icon: CalendarRange, label: 'My Bookings' },
];

const adminItems = [
  { to: '/admin/facilities', icon: Settings, label: 'Manage Facilities' },
  { to: '/admin/bookings', icon: Shield, label: 'Manage Bookings' },
  { to: '/admin/users', icon: Users, label: 'Manage Users' },
];

export default function Sidebar({ collapsed, setCollapsed, isMobile, onClose }) {
  const { user } = useAuth();
  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={clsx(
        'h-full bg-white border-r border-gray-200 flex flex-col',
        isMobile ? 'w-72 shadow-2xl' : 'fixed left-0 top-0 z-40 h-screen transition-all duration-300',
        !isMobile && (collapsed ? 'w-[72px]' : 'w-64')
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {(!collapsed || isMobile) && (
            <span className="font-bold text-gray-900 whitespace-nowrap text-lg">
              CampusHub
            </span>
          )}
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors active:scale-90"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="mb-3">
          {(!collapsed || isMobile) && (
            <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Main
            </p>
          )}
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={handleNavClick}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {(!collapsed || isMobile) && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>

        {user?.role === 'admin' && (
          <div className="pt-3 border-t border-gray-100">
            {(!collapsed || isMobile) && (
              <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Admin
              </p>
            )}
            {adminItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                  )
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {(!collapsed || isMobile) && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-12 border-t border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      )}
    </aside>
  );
}
