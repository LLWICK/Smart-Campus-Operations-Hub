import clsx from 'clsx';
import { BOOKING_STATUS } from '../../utils/constants';

const statusFilters = [
  { value: '', label: 'All' },
  ...Object.entries(BOOKING_STATUS).map(([value, { label }]) => ({ value, label })),
];

export default function BookingFilters({ activeStatus, onChange }) {
  return (
    <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
      {statusFilters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={clsx(
            'px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 active:scale-[0.97]',
            activeStatus === filter.value
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
