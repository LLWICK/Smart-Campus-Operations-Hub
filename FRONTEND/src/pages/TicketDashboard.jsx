import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Wrench,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Ticket as TicketIcon,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";

// Import your dummy data
import { DUMMY_TICKETS } from "../dummy_data/ticket";

// Import your existing components
import StatusBadge from "../components/common/StatusBadge";
import AnimatedCounter from "../components/common/AnimatedCounter";
import {
  StatCardSkeleton,
  BookingCardSkeleton as TicketCardSkeleton,
} from "../components/common/Skeleton";

export default function TicketDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay
    const fetchData = () => {
      setLoading(true);
      setTimeout(() => {
        // Calculate stats from dummy data
        const calculatedStats = {
          totalTickets: DUMMY_TICKETS.length,
          openTickets: DUMMY_TICKETS.filter((t) => t.status === "OPEN").length,
          inProgress: DUMMY_TICKETS.filter((t) => t.status === "IN_PROGRESS")
            .length,
          resolved: DUMMY_TICKETS.filter(
            (t) => t.status === "RESOLVED" || t.status === "CLOSED",
          ).length,
          highPriority: DUMMY_TICKETS.filter((t) => t.priority === "High")
            .length,
        };

        setStats(calculatedStats);
        setRecentTickets(DUMMY_TICKETS.slice(0, 5));
        setLoading(false);
      }, 800);
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: "Total Tickets",
      value: stats?.totalTickets || 0,
      icon: TicketIcon,
      bgIcon: "bg-primary-50 text-primary-600",
    },
    {
      title: "Open Issues",
      value: stats?.openTickets || 0,
      icon: AlertCircle,
      bgIcon: "bg-blue-50 text-blue-600",
    },
    {
      title: "In Progress",
      value: stats?.inProgress || 0,
      icon: Clock,
      bgIcon: "bg-amber-50 text-amber-600",
    },
    {
      title: "Resolved",
      value: stats?.resolved || 0,
      icon: CheckCircle2,
      bgIcon: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <span className="text-sm font-medium text-primary-600">
              Support Metrics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Support Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here is an overview of current support requests.
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Raise Ticket
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : statCards.map((card) => (
              <div
                key={card.title}
                className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.bgIcon} group-hover:scale-110 transition-transform`}
                  >
                    <card.icon className="w-5 h-5" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-gray-200 group-hover:text-gray-400" />
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
        {/* Recent Tickets */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Support Requests
            </h2>
            <Link
              to="/tickets"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1 group"
            >
              View all{" "}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <TicketCardSkeleton key={i} />
                ))}
              </div>
            ) : recentTickets.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <TicketIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900">
                  No tickets found
                </p>
              </div>
            ) : (
              recentTickets.map((ticket, index) => (
                <Link
                  key={ticket.tid}
                  to={`/tickets/${ticket.tid}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/80 transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all text-gray-400 group-hover:text-primary-600">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {ticket.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        #{ticket.tid} &middot; {ticket.category} &middot;{" "}
                        {format(new Date(ticket.createdAt), "MMM dd")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`hidden sm:block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${ticket.priority === "High" ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"}`}
                    >
                      {ticket.priority}
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Status Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ticket Status
            </h2>
            <div className="space-y-4">
              {[
                {
                  label: "Open",
                  color: "bg-blue-500",
                  value: stats?.openTickets,
                },
                {
                  label: "In Progress",
                  color: "bg-amber-500",
                  value: stats?.inProgress,
                },
                {
                  label: "Resolved",
                  color: "bg-emerald-500",
                  value: stats?.resolved,
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${item.color}`}
                      />
                      <span className="text-sm text-gray-600">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      <AnimatedCounter value={item.value || 0} />
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${item.color} transition-all duration-1000`}
                      style={{
                        width: `${stats?.totalTickets ? (item.value / stats.totalTickets) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Helpdesk Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <SidebarAction
                to="/inventory"
                icon={Wrench}
                title="Inventory"
                desc="Check resource status"
                color="bg-primary-50 text-primary-600"
              />
              <SidebarAction
                to="/tickets/new"
                icon={Plus}
                title="Urgent Ticket"
                desc="Flag priority issue"
                color="bg-emerald-50 text-emerald-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for Sidebar Actions
function SidebarAction({ to, icon: Icon, title, desc, color }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group"
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500" />
    </Link>
  );
}
