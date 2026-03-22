import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CalendarRange } from 'lucide-react';
import { bookingApi } from '../api/bookingApi';
import BookingCard from '../components/bookings/BookingCard';
import BookingFilters from '../components/bookings/BookingFilters';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { BookingCardSkeleton } from '../components/common/Skeleton';

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
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            New Booking
          </Link>
        }
      />

      <BookingFilters activeStatus={statusFilter} onChange={setStatusFilter} />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <BookingCardSkeleton key={i} />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No bookings found"
          message={statusFilter ? 'No bookings match the selected filter' : 'You have not made any bookings yet'}
          action={
            !statusFilter ? (
              <Link
                to="/bookings/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Booking
              </Link>
            ) : (
              <button
                onClick={() => setStatusFilter('')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
              >
                Show All Bookings
              </button>
            )
          }
        />
      ) : (
        <>
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-900">{bookings.length}</span>{' '}
            {bookings.length === 1 ? 'booking' : 'bookings'}
          </p>
          <div className="space-y-3 stagger">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
