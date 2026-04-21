import clsx from 'clsx';
import { BOOKING_STATUS, FACILITY_STATUS } from '../../utils/constants';

export default function StatusBadge({ status, type = 'booking' }) {
  const statusMap = type === 'facility' ? FACILITY_STATUS : BOOKING_STATUS;
  const config = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-600' };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-colors',
        config.color
      )}
    >
      <span
        className={clsx('w-1.5 h-1.5 rounded-full', {
          'bg-emerald-500': status === 'ACTIVE' || status === 'APPROVED',
          'bg-blue-500': status === 'CHECKED_IN',
          'bg-amber-500': status === 'PENDING',
          'bg-red-500': status === 'OUT_OF_SERVICE' || status === 'REJECTED',
          'bg-gray-400': status === 'CANCELLED',
        })}
      />
      {config.label}
    </span>
  );
}
