import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CalendarRange,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { dashboardApi } from '../api/dashboardApi';
import { bookingApi } from '../api/bookingApi';
import StatusBadge from '../components/common/StatusBadge';
import AnimatedCounter from '../components/common/AnimatedCounter';
import { StatCardSkeleton, BookingCardSkeleton } from '../components/common/Skeleton';
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

  const statCards = [
    {
      title: 'Total Facilities',
      value: stats?.totalFacilities || 0,
      icon: Building2,
      gradient: 'from-primary-500 to-primary-600',
      bgIcon: 'bg-primary-50 text-primary-600',
    },
    {
      title: 'Active Facilities',
      value: stats?.activeFacilities || 0,
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-emerald-600',
      bgIcon: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: CalendarRange,
      gradient: 'from-blue-500 to-blue-600',
      bgIcon: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Pending Approvals',
      value: stats?.pendingBookings || 0,
      icon: Clock,
      gradient: 'from-amber-500 to-amber-600',
      bgIcon: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <span className="text-sm font-medium text-primary-600">Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here is your campus overview.
          </p>
        </div>
        <Link
          to="/bookings/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New Booking
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card) => (
              <div
                key={card.title}
                className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.bgIcon} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <card.icon className="w-5 h-5" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors" />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    <AnimatedCounter value={card.value} />
                  </p>
                </div>
              </div>
            ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Link
              to="/bookings"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1 group"
            >
              View all{' '}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <BookingCardSkeleton key={i} />
                ))}
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <CalendarRange className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-900">No bookings yet</p>
                <p className="text-xs text-gray-500 mt-1">Create your first booking to get started</p>
                <Link
                  to="/bookings/new"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-50 text-primary-600 text-sm font-medium rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Booking
                </Link>
              </div>
            ) : (
              recentBookings.map((booking, index) => (
                <Link
                  key={booking.id}
                  to={`/bookings/${booking.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/80 transition-colors group"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
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
                  <div className="flex items-center gap-2">
                    <StatusBadge status={booking.status} />
                    <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Booking Status Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h2>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-200" />
                      <div className="h-3 w-16 bg-gray-200 rounded" />
                    </div>
                    <div className="h-4 w-8 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {[
                    { label: 'Approved', color: 'bg-emerald-500', value: stats?.approvedBookings },
                    { label: 'Pending', color: 'bg-amber-500', value: stats?.pendingBookings },
                    { label: 'Rejected', color: 'bg-red-500', value: stats?.rejectedBookings },
                    { label: 'Cancelled', color: 'bg-gray-400', value: stats?.cancelledBookings },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                          <span className="text-sm text-gray-600">{item.label}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          <AnimatedCounter value={item.value || 0} />
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${item.color} transition-all duration-1000 ease-out`}
                          style={{
                            width: `${stats?.totalBookings ? ((item.value || 0) / stats.totalBookings) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to="/facilities"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 group-hover:scale-105 transition-all duration-200">
                  <Building2 className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Browse Facilities</p>
                  <p className="text-xs text-gray-500">View available resources</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
              </Link>
              <Link
                to="/bookings/new"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 group-hover:scale-105 transition-all duration-200">
                  <Plus className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Quick Book</p>
                  <p className="text-xs text-gray-500">Reserve a facility now</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
              </Link>
              <Link
                to="/admin/bookings"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 group-hover:scale-105 transition-all duration-200">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Review Pending</p>
                  <p className="text-xs text-gray-500">Approve or reject bookings</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
