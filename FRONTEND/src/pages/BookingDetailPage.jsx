import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarRange,
  Clock,
  Users,
  Building2,
  MessageSquare,
  XCircle,
  ExternalLink,
  Copy,
  CheckCircle2,
  Pencil,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { bookingApi } from '../api/bookingApi';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import { SkeletonBox } from '../components/common/Skeleton';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);
  const [copied, setCopied] = useState(false);

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
      toast.success('Booking cancelled successfully');
      setCancelModal(false);
      const res = await bookingApi.getById(id);
      setBooking(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const copyBookingId = () => {
    navigator.clipboard.writeText(booking.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Booking ID copied');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <SkeletonBox className="h-5 w-16" />
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-8 space-y-4">
            <SkeletonBox className="h-6 w-24" />
            <SkeletonBox className="h-8 w-64" />
            <SkeletonBox className="h-4 w-32" />
            <div className="grid grid-cols-2 gap-4 pt-4">
              <SkeletonBox className="h-20" />
              <SkeletonBox className="h-20" />
              <SkeletonBox className="h-20" />
              <SkeletonBox className="h-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const isOwnerOrAdmin =
    user?.role === 'admin' ||
    (user?.userId && booking.userId && user.userId === booking.userId);
  const canCancel =
    isOwnerOrAdmin && (booking.status === 'PENDING' || booking.status === 'APPROVED');
  const canEdit = isOwnerOrAdmin && booking.status === 'PENDING';

  const statusConfig = {
    PENDING: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800' },
    APPROVED: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800' },
    CHECKED_IN: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
    REJECTED: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
    CANCELLED: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600' },
  };

  const sc = statusConfig[booking.status] || statusConfig.PENDING;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Bookings
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-fade-in">
        {/* Status Banner */}
        <div className={`px-6 sm:px-8 py-4 ${sc.bg} border-b ${sc.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusBadge status={booking.status} />
              <span className={`text-sm font-medium ${sc.text}`}>
                {booking.status === 'PENDING' && 'Awaiting admin review'}
                {booking.status === 'APPROVED' && 'Your booking has been approved'}
                {booking.status === 'CHECKED_IN' && 'Successfully checked in'}
                {booking.status === 'REJECTED' && 'Your booking was rejected'}
                {booking.status === 'CANCELLED' && 'This booking was cancelled'}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{booking.facilityName}</h1>
              <button
                onClick={copyBookingId}
                className="mt-1 text-xs text-gray-400 hover:text-gray-600 inline-flex items-center gap-1.5 transition-colors"
              >
                #{booking.id.slice(-8)}
                {copied ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {canEdit && (
                <Link
                  to={`/bookings/${booking.id}/edit`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-xl hover:bg-primary-100 transition-all duration-200 active:scale-[0.98]"
                >
                  <Pencil className="w-4 h-4" />
                  Edit booking
                </Link>
              )}
              {canCancel && (
                <button
                  type="button"
                  onClick={() => setCancelModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all duration-200 active:scale-[0.98]"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 pb-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                icon: CalendarRange,
                label: 'Date',
                value: format(new Date(booking.date), 'EEEE, MMMM dd, yyyy'),
              },
              {
                icon: Clock,
                label: 'Time',
                value: `${booking.startTime} - ${booking.endTime}`,
              },
              {
                icon: Users,
                label: 'Expected Attendees',
                value: `${booking.expectedAttendees} people`,
              },
              {
                icon: Building2,
                label: 'Booked By',
                value: booking.userName,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <item.icon className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Purpose</p>
                <p className="text-sm text-gray-900 leading-relaxed">{booking.purpose}</p>
              </div>
            </div>
          </div>

          {booking.adminReason && (
            <div
              className={`p-4 rounded-xl border ${
                booking.status === 'APPROVED' || booking.status === 'CHECKED_IN'
                  ? 'bg-emerald-50 border-emerald-200'
                  : booking.status === 'REJECTED'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <p className="text-xs font-semibold text-gray-500 mb-1">Admin Response</p>
              <p
                className={`text-sm leading-relaxed ${
                  booking.status === 'APPROVED' || booking.status === 'CHECKED_IN'
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

          {booking.status === 'APPROVED' && booking.checkInCode && (
            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <QrCode className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-blue-900">QR Code Check-In</h3>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                  <QRCodeSVG
                    value={`${window.location.origin}/bookings/checkin/${booking.checkInCode}`}
                    size={160}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div className="text-center sm:text-left space-y-2 flex-1">
                  <p className="text-sm text-blue-800 font-medium">
                    Scan this QR code at the facility to check in
                  </p>
                  <p className="text-xs text-blue-600">
                    Check-in is available 30 minutes before your booking starts until the booking end time on {format(new Date(booking.date), 'MMM dd, yyyy')}.
                  </p>
                  <Link
                    to={`/bookings/checkin/${booking.checkInCode}`}
                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Open Check-In Page
                  </Link>
                </div>
              </div>
            </div>
          )}

          {booking.status === 'CHECKED_IN' && (
            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Checked In</p>
                  <p className="text-xs text-blue-600">You have successfully checked in for this booking.</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-400 space-y-1">
              {booking.createdAt && (
                <p>Created: {format(new Date(booking.createdAt), 'MMM dd, yyyy HH:mm')}</p>
              )}
              {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
                <p>Updated: {format(new Date(booking.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
              )}
            </div>
            <Link
              to={`/facilities/${booking.facilityId}`}
              className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium group"
            >
              View Facility
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
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
