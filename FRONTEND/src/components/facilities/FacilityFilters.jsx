import { Search, SlidersHorizontal } from 'lucide-react';
import clsx from 'clsx';
import { FACILITY_TYPES } from '../../utils/constants';

const allTypeFilter = { value: '', label: 'All Types' };
const typeFilters = [allTypeFilter, ...FACILITY_TYPES];

export default function FacilityFilters({ filters, setFilters }) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search facilities by name..."
          value={filters.search || ''}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex flex-wrap gap-1.5 sm:gap-2 flex-1">
          {typeFilters.map((type) => (
            <button
              key={type.value}
              onClick={() => setFilters({ ...filters, type: type.value })}
              className={clsx(
                'px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all active:scale-[0.97]',
                filters.type === type.value
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
              )}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 hidden sm:block" />
          <input
            type="number"
            placeholder="Min capacity"
            value={filters.minCapacity || ''}
            onChange={(e) =>
              setFilters({ ...filters, minCapacity: e.target.value ? parseInt(e.target.value) : '' })
            }
            className="w-full sm:w-32 px-3 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
