import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Wrench,
  Clock,
  CheckCircle2,
  Lock,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Sparkles,
  UserCheck,
  ClipboardList,
  AlertCircle,
} from "lucide-react";
import { adminApi } from "../api/admiTApi";
import StatusBadge from "../components/common/StatusBadge";
import AnimatedCounter from "../components/common/AnimatedCounter";
import { StatCardSkeleton } from "../components/common/Skeleton";
import toast from "react-hot-toast";

export default function AdminTicketDashboard() {
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
    console.log(stats);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
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
    try {
      await adminApi.assignTechnician(ticketId, techId);
      toast.success("Technician assigned & Status moved to In Progress");
      loadData();
    } catch (err) {
      toast.error("Assignment failed");
    }
  };

  const handleStatusUpdate = async (ticketId, status) => {
    try {
      await adminApi.updateTicketStatus(ticketId, status);
      toast.success(`Ticket marked as ${status}`);
      loadData();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  // Stats Logic mapping to your TicketStatus Enum
  const stats = {
    total: tickets.length,
    // Use .toUpperCase() to ensure it matches the Java Enum exactly
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
      t.tid?.toLowerCase().includes(searchTerm.toLowerCase()),
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
            Monitor lifecycle from OPEN to CLOSED.
          </p>
        </div>
      </div>

      {/* 1. Stat Cards Row */}
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
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
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
        {/* 2. Ticket Management Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/30">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by description or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none bg-white transition-all"
                />
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-100">
                <ClipboardList className="w-4 h-4 text-primary-500" />
                {filteredTickets.length} TOTAL
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-400 font-bold border-b border-gray-100 uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Request Detail</th>
                    <th className="px-6 py-4">Technician</th>
                    <th className="px-6 py-4 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.tid}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <StatusBadge status={ticket.status} />
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate max-w-[180px]">
                              {ticket.description}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5 tracking-widest">
                              #{ticket.tid.substring(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <UserCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <select
                            className="pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer"
                            value={ticket.assignedToTechnicianId || ""}
                            onChange={(e) =>
                              handleAssign(ticket.tid, e.target.value)
                            }
                          >
                            <option value="">Select Tech...</option>
                            {technicians.map((tech) => (
                              <option key={tech.id} value={tech.id}>
                                {tech.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() =>
                              handleStatusUpdate(ticket.tid, "IN_PROGRESS")
                            }
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-all"
                            title="Set In Progress"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(ticket.tid, "RESOLVED")
                            }
                            className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-all"
                            title="Mark Resolved"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(ticket.tid, "CLOSED")
                            }
                            className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-all"
                            title="Close Ticket"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. Sidebar Breakdown */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">
              Status Pipeline
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
                    <span className="text-[11px] font-bold text-gray-500 tracking-tighter">
                      {item.label}
                    </span>
                    <span className="text-xs font-black text-gray-900">
                      {item.val}
                    </span>
                  </div>
                  <div className="w-full bg-gray-50 rounded-full h-2 overflow-hidden border border-gray-100">
                    <div
                      className={`h-full ${item.color} transition-all duration-1000 ease-out shadow-sm`}
                      style={{
                        width: `${stats.total ? (item.val / stats.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Helper */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold">Efficiency Check</h3>
            </div>
            <p className="text-primary-100 text-xs leading-relaxed">
              {stats.open > 5
                ? "⚠️ High volume of unassigned tickets detected."
                : "✅ Ticket flow is currently stable."}
              Assign technicians to "OPEN" tickets to begin the resolution
              process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
