import clsx from 'clsx';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 6);

export default function TimeSlotGrid({ bookings = [], facilityStart = '06:00', facilityEnd = '19:00' }) {
  const startHour = parseInt(facilityStart?.split(':')[0]) || 6;
  const endHour = parseInt(facilityEnd?.split(':')[0]) || 19;
  const visibleHours = HOURS.filter((h) => h >= startHour && h < endHour);

  const getSlotStatus = (hour) => {
    const hourStr = String(hour).padStart(2, '0') + ':00';
    const nextHourStr = String(hour + 1).padStart(2, '0') + ':00';

    for (const booking of bookings) {
      if (booking.startTime < nextHourStr && booking.endTime > hourStr) {
        if (booking.status === 'APPROVED' || booking.status === 'CHECKED_IN') return 'booked';
        if (booking.status === 'PENDING') return 'pending';
      }
    }
    return 'available';
  };

  const statusColors = {
    available: 'bg-emerald-100 border-emerald-200',
    booked: 'bg-red-100 border-red-200',
    pending: 'bg-amber-100 border-amber-200',
  };

  const statusLabels = {
    available: 'Available',
    booked: 'Booked',
    pending: 'Pending',
  };

  return (
    <div>
      <div className="flex items-center gap-2 sm:gap-4 mb-3 flex-wrap">
        <span className="text-xs font-medium text-gray-500">Time Slots</span>
        <div className="flex gap-2 sm:gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-emerald-100 border border-emerald-200" />
            <span className="text-[10px] sm:text-xs text-gray-500">Free</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-amber-100 border border-amber-200" />
            <span className="text-[10px] sm:text-xs text-gray-500">Pending</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-red-100 border border-red-200" />
            <span className="text-[10px] sm:text-xs text-gray-500">Booked</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1 sm:gap-1.5">
        {visibleHours.map((hour) => {
          const status = getSlotStatus(hour);
          return (
            <div
              key={hour}
              className={clsx(
                'flex flex-col items-center justify-center py-2 sm:py-2.5 px-1 rounded-lg border text-xs font-medium transition-all',
                statusColors[status]
              )}
              title={`${String(hour).padStart(2, '0')}:00 - ${String(hour + 1).padStart(2, '0')}:00: ${statusLabels[status]}`}
            >
              <span className="text-gray-700 text-[10px] sm:text-xs">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
