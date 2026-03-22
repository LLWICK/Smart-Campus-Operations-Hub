import { Link } from 'react-router-dom';
import { CalendarRange, Clock, Users, ChevronRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { format } from 'date-fns';

export default function BookingCard({ booking }) {
  return (
    <Link
      to={`/bookings/${booking.id}`}
      className="block bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-primary-200 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
            <CalendarRange className="w-6 h-6 text-primary-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {booking.facilityName}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5 truncate">{booking.purpose}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={booking.status} />
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-400 transition-colors" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <CalendarRange className="w-3.5 h-3.5" />
          <span>{format(new Date(booking.date), 'MMM dd, yyyy')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{booking.startTime} - {booking.endTime}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span>{booking.expectedAttendees} attendees</span>
        </div>
      </div>

      {booking.adminReason && (
        <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">
            <span className="font-medium">Admin note:</span> {booking.adminReason}
          </p>
        </div>
      )}
    </Link>
  );
}
