import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarRange,
  Clock,
  Users,
  MapPin,
  Building2,
  MessageSquare,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingApi } from '../api/bookingApi';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmModal from '../components/common/ConfirmModal';
import { format } from 'date-fns';

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await bookingApi.getById(id);
        setBooking(res.data);
      } catch {
        toast.error('Booking not found');
        navigate('/bookings');
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [id, navigate]);

  const handleCancel = async () => {
    try {
      await bookingApi.cancel(id);
      toast.success('Booking cancelled');
      setCancelModal(false);
      const res = await bookingApi.getById(id);
      setBooking(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  if (loading) return <LoadingSpinner message="Loading booking..." />;
  if (!booking) return null;

  const canCancel = booking.status === 'PENDING' || booking.status === 'APPROVED';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 sm:px-8 py-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={booking.status} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{booking.facilityName}</h1>
              <p className="mt-1 text-sm text-gray-500">Booking #{booking.id.slice(-8)}</p>
            </div>
            {canCancel && (
              <button
                onClick={() => setCancelModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Cancel Booking
              </button>
            )}
          </div>
        </div>

        <div className="px-6 sm:px-8 py-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <CalendarRange className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {format(new Date(booking.date), 'EEEE, MMMM dd, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-semibold text-gray-900">
                  {booking.startTime} - {booking.endTime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Expected Attendees</p>
                <p className="text-sm font-semibold text-gray-900">{booking.expectedAttendees}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Booked By</p>
                <p className="text-sm font-semibold text-gray-900">{booking.userName}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-1">Purpose</p>
                <p className="text-sm text-gray-900">{booking.purpose}</p>
              </div>
            </div>
          </div>

          {booking.adminReason && (
            <div
              className={`p-4 rounded-xl ${
                booking.status === 'APPROVED'
                  ? 'bg-emerald-50'
                  : booking.status === 'REJECTED'
                  ? 'bg-red-50'
                  : 'bg-gray-50'
              }`}
            >
              <p className="text-xs font-medium text-gray-500 mb-1">Admin Response</p>
              <p
                className={`text-sm ${
                  booking.status === 'APPROVED'
                    ? 'text-emerald-700'
                    : booking.status === 'REJECTED'
                    ? 'text-red-700'
                    : 'text-gray-700'
                }`}
              >
                {booking.adminReason}
              </p>
            </div>
          )}

          <div className="text-xs text-gray-400 flex gap-6">
            {booking.createdAt && (
              <span>Created: {format(new Date(booking.createdAt), 'MMM dd, yyyy HH:mm')}</span>
            )}
            {booking.updatedAt && (
              <span>Updated: {format(new Date(booking.updatedAt), 'MMM dd, yyyy HH:mm')}</span>
            )}
          </div>

          <Link
            to={`/facilities/${booking.facilityId}`}
            className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            <Building2 className="w-4 h-4" />
            View Facility Details
          </Link>
        </div>
      </div>

      <ConfirmModal
        isOpen={cancelModal}
        onClose={() => setCancelModal(false)}
        onConfirm={handleCancel}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Cancel Booking"
        variant="danger"
      />
    </div>
  );
}
