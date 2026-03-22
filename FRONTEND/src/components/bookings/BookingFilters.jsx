import clsx from 'clsx';
import { BOOKING_STATUS } from '../../utils/constants';

const statusFilters = [
  { value: '', label: 'All' },
  ...Object.entries(BOOKING_STATUS).map(([value, { label }]) => ({ value, label })),
];

export default function BookingFilters({ activeStatus, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {statusFilters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={clsx(
            'px-4 py-2 rounded-xl text-sm font-medium transition-all',
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
