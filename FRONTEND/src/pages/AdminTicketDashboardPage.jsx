import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Clock,
  CheckCircle2,
  Lock,
  Search,
  ArrowRight,
  TrendingUp,
  Sparkles,
  UserCheck,
  ClipboardList,
  AlertCircle,
  ExternalLink,
  FilterX,
} from "lucide-react";
import { adminApi } from "../api/admiTApi";
import StatusBadge from "../components/common/StatusBadge";
import AnimatedCounter from "../components/common/AnimatedCounter";
import { StatCardSkeleton } from "../components/common/Skeleton";
import toast from "react-hot-toast";

export default function AdminTicketDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(false); // Optimization: Start loading
      const [ticketData, userData] = await Promise.all([
        adminApi.getAllTickets(),
        adminApi.getUsers(),
      ]);
      setTickets(ticketData);
      setTechnicians(
        userData.filter((u) => u.role?.toLowerCase() === "technician"),
      );
    } catch (err) {
      toast.error("Failed to refresh dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (ticketId, techId) => {
    if (!techId) return;
    try {
      await adminApi.assignTechnician(ticketId, techId);
      toast.success("Technician assigned & Work In Progress");
      loadData();
    } catch (err) {
      toast.error("Assignment failed");
    }
  };

  const handleStatusUpdate = async (ticketId, status) => {
    try {
      await adminApi.updateTicketStatus(ticketId, status);
      toast.success(`Marked as ${status}`);
      loadData();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  // Stats Logic mapping to TicketStatus Enum
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status?.toUpperCase() === "OPEN").length,
    inProgress: tickets.filter((t) => t.status?.toUpperCase() === "IN_PROGRESS")
      .length,
    resolved: tickets.filter((t) => t.status?.toUpperCase() === "RESOLVED")
      .length,
    closed: tickets.filter((t) => t.status?.toUpperCase() === "CLOSED").length,
  };

  const statCards = [
    {
      title: "New Requests",
      value: stats.open,
      icon: AlertCircle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Active Work",
      value: stats.inProgress,
      icon: Wrench,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Resolved Today",
      value: stats.resolved,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Archived/Closed",
      value: stats.closed,
      icon: Lock,
      color: "text-gray-600",
      bg: "bg-gray-100",
    },
  ];

  const filteredTickets = tickets.filter(
    (t) =>
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assignedToTechnicianId
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <span className="text-sm font-medium text-primary-600">
              Operations Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Admin Ticket Manager
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage the entire maintenance lifecycle.
          </p>
        </div>
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
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}
                  >
                    <card.icon className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-gray-200" />
                </div>
                <div className="mt-4">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    {card.title}
                  </p>
                  <p className="text-3xl font-black text-gray-900 mt-1">
                    <AnimatedCounter value={card.value} />
                  </p>
                </div>
              </div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket Management Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/30">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by ID, Tech, or Detail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-white px-4 py-1.5 rounded-xl border border-gray-200">
                <ClipboardList className="w-4 h-4 text-primary-500" />
                {filteredTickets.length} TICKETS FOUND
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 text-gray-400 font-bold border-b border-gray-100 uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Request Detail</th>
                    <th className="px-6 py-4">Assignment</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => (
                      <tr
                        key={ticket.tid}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <StatusBadge status={ticket.status} />
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 truncate max-w-[200px] group-hover:text-primary-600 transition-colors">
                                {ticket.description}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                                #{ticket.tid.substring(0, 12)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative max-w-[140px]">
                            <UserCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <select
                              className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-[11px] font-bold bg-white focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer"
                              value={ticket.assignedToTechnicianId || ""}
                              onChange={(e) =>
                                handleAssign(ticket.tid, e.target.value)
                              }
                            >
                              <option value="">Unassigned</option>
                              {technicians.map((tech) => (
                                <option key={tech.id} value={tech.id}>
                                  {tech.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-1">
                            <button
                              onClick={() =>
                                handleStatusUpdate(ticket.tid, "RESOLVED")
                              }
                              className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-all"
                              title="Resolve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/admin/tickets/${ticket.tid}`)
                              }
                              className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg transition-all"
                              title="Full Detail"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-30">
                          <FilterX className="w-12 h-12" />
                          <p className="font-bold uppercase tracking-widest text-xs">
                            No matching tickets
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Status Breakdown */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6">
              Pipeline Health
            </h2>
            <div className="space-y-5">
              {[
                { label: "OPEN", color: "bg-amber-500", val: stats.open },
                {
                  label: "IN PROGRESS",
                  color: "bg-blue-500",
                  val: stats.inProgress,
                },
                {
                  label: "RESOLVED",
                  color: "bg-emerald-500",
                  val: stats.resolved,
                },
                { label: "CLOSED", color: "bg-gray-400", val: stats.closed },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-gray-400 tracking-wider">
                      {item.label}
                    </span>
                    <span className="text-xs font-black text-gray-900">
                      {item.val}
                    </span>
                  </div>
                  <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all duration-1000 ease-out`}
                      style={{
                        width: `${stats.total ? (item.val / stats.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Insights Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
            <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-white/5 rotate-12" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-500 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-sm tracking-tight">
                  Daily Insight
                </h3>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                {stats.open > 0
                  ? `There are ${stats.open} tickets waiting for a technician. High priority for unassigned requests is recommended.`
                  : "All tickets are currently being handled or resolved. Great job!"}
              </p>
              <button
                onClick={() => navigate("/admin/users")}
                className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-400 hover:text-primary-300 transition-colors"
              >
                Manage Staff <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
