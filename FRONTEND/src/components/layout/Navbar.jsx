import { Menu, User, Building2 } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-3 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-1 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all active:scale-95"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm sm:text-base">CampusHub</span>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-gray-100">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-sm">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-tight">Campus User</p>
            <p className="text-xs text-gray-500">user@campus.edu</p>
          </div>
        </div>
      </div>
    </header>
  );
}
