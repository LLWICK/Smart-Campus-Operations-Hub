import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CalendarRange,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { dashboardApi } from '../api/dashboardApi';
import { bookingApi } from '../api/bookingApi';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          dashboardApi.getStats(),
          bookingApi.getAll(),
        ]);
        setStats(statsRes.data);
        setRecentBookings(bookingsRes.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const statCards = [
    {
      title: 'Total Facilities',
      value: stats?.totalFacilities || 0,
      icon: Building2,
      color: 'from-primary-500 to-primary-700',
      bgIcon: 'bg-primary-100 text-primary-600',
    },
    {
      title: 'Active Facilities',
      value: stats?.activeFacilities || 0,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-emerald-700',
      bgIcon: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: CalendarRange,
      color: 'from-blue-500 to-blue-700',
      bgIcon: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Pending Approvals',
      value: stats?.pendingBookings || 0,
      icon: Clock,
      color: 'from-amber-500 to-amber-700',
      bgIcon: 'bg-amber-100 text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here is your campus overview.
          </p>
        </div>
        <Link
          to="/bookings/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Booking
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.bgIcon}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-300" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Link
              to="/bookings"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentBookings.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-500">
                No bookings yet. Create your first booking!
              </div>
            ) : (
              recentBookings.map((booking) => (
                <Link
                  key={booking.id}
                  to={`/bookings/${booking.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <CalendarRange className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {booking.facilityName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(booking.date), 'MMM dd, yyyy')} &middot;{' '}
                        {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={booking.status} />
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-gray-600">Approved</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {stats?.approvedBookings || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {stats?.pendingBookings || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-gray-600">Rejected</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {stats?.rejectedBookings || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-sm text-gray-600">Cancelled</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {stats?.cancelledBookings || 0}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
            <Link
              to="/facilities"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Browse Facilities</p>
                <p className="text-xs text-gray-500">View available resources</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-primary-600 transition-colors" />
            </Link>
            <Link
              to="/bookings/new"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Plus className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Quick Book</p>
                <p className="text-xs text-gray-500">Reserve a facility now</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-emerald-600 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
