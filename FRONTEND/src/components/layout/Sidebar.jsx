import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  CalendarRange,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
  Ticket,
  Users,
  ClipboardList,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/facilities", icon: Building2, label: "Facilities" },
  { to: "/bookings", icon: CalendarRange, label: "My Bookings" },
];

const adminItems = [
  { to: "/admin/facilities", icon: Settings, label: "Manage Facilities" },
  { to: "/admin/bookings", icon: Shield, label: "Manage Bookings" },
  { to: "/admin/users", icon: Users, label: "Manage Users" },
  { to: "/admin/tickets", icon: Ticket, label: "Manage Tickets" },
];

const technicianItems = [
  { to: "/tickets", icon: ClipboardList, label: "Assigned Tickets" },
];

// Student / Lecturer specific links
const studentItems = [
  { to: "/facilities", icon: Building2, label: "Facilities" },
  { to: "/bookings", icon: CalendarRange, label: "My Bookings" },
  { to: "/tickets", icon: Ticket, label: "My Support Tickets" },
];

export default function Sidebar({
  collapsed,
  setCollapsed,
  isMobile,
  onClose,
}) {
  const { user } = useAuth();

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Helper to render a group of navigation links
  const renderNavGroup = (title, items) => (
    <div className="pt-3 border-t border-gray-100 first:border-t-0 first:pt-0">
      {(!collapsed || isMobile) && (
        <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </p>
      )}
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          onClick={handleNavClick}
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary-50 text-primary-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100",
            )
          }
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          {(!collapsed || isMobile) && <span>{item.label}</span>}
        </NavLink>
      ))}
    </div>
  );

  return (
    <aside
      className={clsx(
        "h-full bg-white border-r border-gray-200 flex flex-col",
        isMobile
          ? "w-72 shadow-2xl"
          : "fixed left-0 top-0 z-40 h-screen transition-all duration-300",
        !isMobile && (collapsed ? "w-[72px]" : "w-64"),
      )}
    >
      {/* Logo Section */}
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
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {/* Always Show Main Items */}
        {renderNavGroup("Main", navItems)}

        {/* Show Admin Items */}
        {user?.role === "admin" && renderNavGroup("Admin Panel", adminItems)}

        {/* Show Technician Items */}
        {user?.role === "technician" &&
          renderNavGroup("Maintenance", technicianItems)}

        {/* Show Student/Lecturer Items */}
        {(user?.role === "student" || user?.role === "lecturer") &&
          renderNavGroup("Services", studentItems)}
      </nav>

      {/* Toggle Button */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-12 border-t border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      )}
    </aside>
  );
}
