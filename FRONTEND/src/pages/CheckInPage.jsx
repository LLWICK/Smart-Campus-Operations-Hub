import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  CalendarRange,
  Clock,
  Users,
  Building2,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingApi } from '../api/bookingApi';
import StatusBadge from '../components/common/StatusBadge';
import { format } from 'date-fns';

export default function CheckInPage() {
  const { checkInCode } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await bookingApi.getByCheckInCode(checkInCode);
        setBooking(res.data);
        if (res.data.status === 'CHECKED_IN') {
          setCheckedIn(true);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired check-in code');
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [checkInCode]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await bookingApi.checkIn(checkInCode);
      setBooking(res.data);
      setCheckedIn(true);
      toast.success('Successfully checked in!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Verifying booking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="bg-white rounded-2xl border border-red-200 overflow-hidden shadow-sm">
          <div className="px-8 py-6 bg-red-50 border-b border-red-200 flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <h1 className="text-lg font-bold text-red-800">Verification Failed</h1>
          </div>
          <div className="px-8 py-8 text-center space-y-4">
            <p className="text-sm text-gray-600">{error}</p>
            <Link
              to="/bookings"
              className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to My Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Link
        to="/bookings"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Bookings
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-fade-in">
        {checkedIn ? (
          <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-blue-900">Checked In</h1>
                <p className="text-sm text-blue-600">Booking verified successfully</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-8 py-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-emerald-900">Booking Verification</h1>
                <p className="text-sm text-emerald-600">Confirm check-in for this booking</p>
              </div>
            </div>
          </div>
        )}

        <div className="px-8 py-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{booking.facilityName}</h2>
            <StatusBadge status={booking.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                icon: Building2,
                label: 'Booked By',
                value: booking.userName,
              },
              {
                icon: CalendarRange,
                label: 'Date',
                value: format(new Date(booking.date), 'EEEE, MMM dd, yyyy'),
              },
              {
                icon: Clock,
                label: 'Time',
                value: `${booking.startTime} - ${booking.endTime}`,
              },
              {
                icon: Users,
                label: 'Attendees',
                value: `${booking.expectedAttendees} people`,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl"
              >
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <item.icon className="w-4.5 h-4.5 text-primary-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {booking.purpose && (
            <div className="p-3.5 bg-gray-50 rounded-xl">
              <p className="text-xs font-medium text-gray-500 mb-1">Purpose</p>
              <p className="text-sm text-gray-900">{booking.purpose}</p>
            </div>
          )}

          {!checkedIn && booking.status === 'APPROVED' && (
            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
            >
              {checkingIn ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  Checking in...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4.5 h-4.5" />
                  Confirm Check-In
                </>
              )}
            </button>
          )}

          {!checkedIn && booking.status !== 'APPROVED' && booking.status !== 'CHECKED_IN' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800 font-medium">
                Check-in is only available for approved bookings.
              </p>
              <p className="text-xs text-amber-600 mt-1">
                This booking is currently {booking.status.toLowerCase().replace('_', ' ')}.
              </p>
            </div>
          )}

          {checkedIn && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <p className="text-sm text-blue-800 font-medium">
                You are all set! Enjoy using {booking.facilityName}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
