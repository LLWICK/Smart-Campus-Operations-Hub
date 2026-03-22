import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Users,
  Clock,
  CalendarPlus,
  GraduationCap,
  FlaskConical,
  Monitor,
  Users as UsersIcon,
  CalendarRange,
} from 'lucide-react';
import { facilityApi } from '../api/facilityApi';
import { bookingApi } from '../api/bookingApi';
import StatusBadge from '../components/common/StatusBadge';
import TimeSlotGrid from '../components/bookings/TimeSlotGrid';
import { SkeletonBox } from '../components/common/Skeleton';
import { format } from 'date-fns';

const typeConfig = {
  LECTURE_HALL: { icon: GraduationCap, label: 'Lecture Hall', gradient: 'from-blue-100 to-indigo-200' },
  LAB: { icon: FlaskConical, label: 'Laboratory', gradient: 'from-purple-100 to-violet-200' },
  MEETING_ROOM: { icon: UsersIcon, label: 'Meeting Room', gradient: 'from-emerald-100 to-teal-200' },
  EQUIPMENT: { icon: Monitor, label: 'Equipment', gradient: 'from-amber-100 to-orange-200' },
};

export default function FacilityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facility, setFacility] = useState(null);
  const [todayBookings, setTodayBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const facilityRes = await facilityApi.getById(id);
        setFacility(facilityRes.data);

        const today = format(new Date(), 'yyyy-MM-dd');
        try {
          const bookingsRes = await bookingApi.getByFacilityAndDate(id, today);
          setTodayBookings(bookingsRes.data);
        } catch {
          setTodayBookings([]);
        }
      } catch (err) {
        console.error('Failed to load facility:', err);
        navigate('/facilities');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <SkeletonBox className="h-5 w-16" />
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <SkeletonBox className="h-48 rounded-none" />
          <div className="p-8 space-y-4">
            <SkeletonBox className="h-4 w-24" />
            <SkeletonBox className="h-8 w-64" />
            <SkeletonBox className="h-4 w-full" />
            <div className="grid grid-cols-3 gap-4 pt-4">
              <SkeletonBox className="h-20" />
              <SkeletonBox className="h-20" />
              <SkeletonBox className="h-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!facility) return null;

  const config = typeConfig[facility.type] || typeConfig.EQUIPMENT;
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Facilities
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-fade-in">
        <div className={`h-48 bg-gradient-to-br ${config.gradient} flex items-center justify-center relative overflow-hidden`}>
          <Icon className="w-28 h-28 text-white/30" />
          <div className="absolute top-4 right-4">
            <StatusBadge status={facility.status} type="facility" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary-600">{config.label}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{facility.name}</h1>
              {facility.description && (
                <p className="mt-3 text-gray-500 leading-relaxed">{facility.description}</p>
              )}
            </div>
            {facility.status === 'ACTIVE' && (
              <Link
                to={`/bookings/new/${facility.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] flex-shrink-0"
              >
                <CalendarPlus className="w-5 h-5" />
                Book Now
              </Link>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Capacity</p>
                <p className="text-sm font-bold text-gray-900">{facility.capacity} people</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <MapPin className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-bold text-gray-900">{facility.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <Clock className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Availability</p>
                <p className="text-sm font-bold text-gray-900">
                  {facility.availabilityStart} - {facility.availabilityEnd}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Slot Visualization */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-fade-in" style={{ animationDelay: '100ms' }}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Today's Availability
        </h2>
        <TimeSlotGrid
          bookings={todayBookings}
          facilityStart={facility.availabilityStart}
          facilityEnd={facility.availabilityEnd}
        />
      </div>

      {/* Today's Bookings List */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CalendarRange className="w-5 h-5 text-gray-400" />
          Today's Bookings
        </h2>
        {todayBookings.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <CalendarRange className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">No bookings for today. This facility is open!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayBookings.map((booking) => (
              <Link
                key={booking.id}
                to={`/bookings/${booking.id}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    {booking.purpose}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {booking.startTime} - {booking.endTime} &middot; {booking.userName} &middot; {booking.expectedAttendees} attendees
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
