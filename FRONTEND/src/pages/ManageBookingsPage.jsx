import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  CalendarRange,
  Clock,
  Eye,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingApi } from '../api/bookingApi';
import BookingFilters from '../components/bookings/BookingFilters';
import StatusBadge from '../components/common/StatusBadge';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { format } from 'date-fns';

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await bookingApi.getAll(params);
      setBookings(res.data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleApprove = async (id) => {
    try {
      await bookingApi.approve(id, { reason: 'Approved' });
      toast.success('Booking approved');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      await bookingApi.reject(rejectModal.id, { reason: rejectReason });
      toast.success('Booking rejected');
      setRejectModal({ open: false, id: null });
      setRejectReason('');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Manage Bookings"
        description="Review, approve, or reject booking requests"
      />

      <BookingFilters activeStatus={statusFilter} onChange={setStatusFilter} />

      {loading ? (
        <LoadingSpinner message="Loading bookings..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No bookings found"
          message={`No ${statusFilter ? statusFilter.toLowerCase() : ''} bookings to display`}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Facility</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Purpose</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4"><p className="text-sm font-medium text-gray-900">{booking.facilityName}</p></td>
                      <td className="px-6 py-4"><p className="text-sm text-gray-600">{booking.userName}</p></td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{format(new Date(booking.date), 'MMM dd, yyyy')}</p>
                        <p className="text-xs text-gray-500">{booking.startTime} - {booking.endTime}</p>
                      </td>
                      <td className="px-6 py-4"><p className="text-sm text-gray-600 truncate max-w-[200px]">{booking.purpose}</p></td>
                      <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/bookings/${booking.id}`} className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </Link>
                          {booking.status === 'PENDING' && (
                            <>
                              <button onClick={() => handleApprove(booking.id)} className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Approve">
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => setRejectModal({ open: true, id: booking.id })} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Reject">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{booking.facilityName}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">by {booking.userName}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{booking.purpose}</p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                    <CalendarRange className="w-3 h-3" />
                    {format(new Date(booking.date), 'MMM dd')}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                    <Clock className="w-3 h-3" />
                    {booking.startTime} - {booking.endTime}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                    <Users className="w-3 h-3" />
                    {booking.expectedAttendees}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end gap-1">
                  <Link to={`/bookings/${booking.id}`} className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors active:scale-95">
                    <Eye className="w-4 h-4" />
                  </Link>
                  {booking.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleApprove(booking.id)} className="p-2.5 rounded-lg text-emerald-500 bg-emerald-50 hover:bg-emerald-100 transition-colors active:scale-95">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setRejectModal({ open: true, id: booking.id })} className="p-2.5 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 transition-colors active:scale-95">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { setRejectModal({ open: false, id: null }); setRejectReason(''); }}
          />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md p-6 animate-scale-in">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Booking</h3>
            <p className="text-sm text-gray-500 mb-4">Please provide a reason for rejecting this booking.</p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              autoFocus
            />
            <div className="mt-4 flex gap-3 justify-end">
              <button
                onClick={() => { setRejectModal({ open: false, id: null }); setRejectReason(''); }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors active:scale-[0.98]"
              >
                Reject Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
