import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CalendarRange } from 'lucide-react';
import { bookingApi } from '../api/bookingApi';
import BookingCard from '../components/bookings/BookingCard';
import BookingFilters from '../components/bookings/BookingFilters';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      try {
        const params = {};
        if (statusFilter) params.status = statusFilter;
        const res = await bookingApi.getAll(params);
        setBookings(res.data);
      } catch (err) {
        console.error('Failed to load bookings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bookings"
        description="View and manage your facility bookings"
        action={
          <Link
            to="/bookings/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Booking
          </Link>
        }
      />

      <BookingFilters activeStatus={statusFilter} onChange={setStatusFilter} />

      {loading ? (
        <LoadingSpinner message="Loading bookings..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No bookings found"
          message={statusFilter ? 'No bookings match the selected filter' : 'You have not made any bookings yet'}
          action={
            <Link
              to="/bookings/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Booking
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
