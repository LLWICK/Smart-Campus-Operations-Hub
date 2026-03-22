import clsx from 'clsx';
import { BOOKING_STATUS, FACILITY_STATUS } from '../../utils/constants';

export default function StatusBadge({ status, type = 'booking' }) {
  const statusMap = type === 'facility' ? FACILITY_STATUS : BOOKING_STATUS;
  const config = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-600' };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
        config.color
      )}
    >
      {config.label}
    </span>
  );
}
