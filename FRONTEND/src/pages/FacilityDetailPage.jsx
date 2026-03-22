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
} from 'lucide-react';
import { facilityApi } from '../api/facilityApi';
import { bookingApi } from '../api/bookingApi';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';

const typeIcons = {
  LECTURE_HALL: GraduationCap,
  LAB: FlaskConical,
  MEETING_ROOM: UsersIcon,
  EQUIPMENT: Monitor,
};

const typeLabels = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Laboratory',
  MEETING_ROOM: 'Meeting Room',
  EQUIPMENT: 'Equipment',
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

  if (loading) return <LoadingSpinner message="Loading facility..." />;
  if (!facility) return null;

  const Icon = typeIcons[facility.type] || Monitor;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center relative">
          <Icon className="w-24 h-24 text-primary-300" />
          <div className="absolute top-4 right-4">
            <StatusBadge status={facility.status} type="facility" />
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary-600">{typeLabels[facility.type]}</p>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">{facility.name}</h1>
              {facility.description && (
                <p className="mt-3 text-gray-500">{facility.description}</p>
              )}
            </div>
            {facility.status === 'ACTIVE' && (
              <Link
                to={`/bookings/new/${facility.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-sm flex-shrink-0"
              >
                <CalendarPlus className="w-5 h-5" />
                Book Now
              </Link>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Capacity</p>
                <p className="text-sm font-semibold text-gray-900">{facility.capacity} people</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-semibold text-gray-900">{facility.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Availability</p>
                <p className="text-sm font-semibold text-gray-900">
                  {facility.availabilityStart} - {facility.availabilityEnd}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Today's Bookings
        </h2>
        {todayBookings.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No bookings for today.</p>
        ) : (
          <div className="space-y-3">
            {todayBookings.map((booking) => (
              <Link
                key={booking.id}
                to={`/bookings/${booking.id}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{booking.purpose}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {booking.startTime} - {booking.endTime} &middot; {booking.userName}
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
