import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ClipboardList,
  Search,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";

// Assuming you have a technicianApi service set up
import { technicianApi } from "../api/technicianAPI";
import { ticketApi } from "../api/ticketAPI";
import StatusBadge from "../components/common/StatusBadge";

export default function TechTicketDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignedTasks();
  }, []);

  const fetchAssignedTasks = async () => {
    try {
      setLoading(true);

      const response = await technicianApi.getMyTasks();
      setTickets(response.data);
    } catch (err) {
      toast.error("Failed to load work queue");
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === "OPEN").length,
    active: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
  };

  const filteredTickets =
    filter === "ALL" ? tickets : tickets.filter((t) => t.status === filter);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Wrench className="w-10 h-10 text-primary-600" />
            Service Terminal
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Manage your assigned technical resolutions and logs.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <StatMiniCard
            label="Pending"
            value={stats.pending}
            color="blue"
            icon={Clock}
          />
          <StatMiniCard
            label="Active"
            value={stats.active}
            color="amber"
            icon={Wrench}
          />
          <StatMiniCard
            label="Done"
            value={stats.resolved}
            color="emerald"
            icon={CheckCircle2}
          />
        </div>
      </div>

      {/* --- Work Queue Section --- */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
        {/* Table Controls */}
        <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-bold text-gray-800">My Work Queue</h2>
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === s
                    ? "bg-primary-600 text-white shadow-md"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* The Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50">
                <th className="px-8 py-5 font-black">Issue Details</th>
                <th className="px-8 py-5 font-black">Priority</th>
                <th className="px-8 py-5 font-black">Status</th>
                <th className="px-8 py-5 font-black">Location/Resource</th>
                <th className="px-8 py-5 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.tid}
                  className="group hover:bg-primary-50/30 transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 capitalize text-base">
                        {ticket.category.toLowerCase().replace("_", " ")}
                      </span>
                      <span className="text-xs text-gray-400 font-mono mt-1">
                        ID: {ticket.tid.substring(0, 8)}...
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                        ticket.priority === "HIGH" ||
                        ticket.priority === "CRITICAL"
                          ? "bg-red-50 text-red-600 border-red-100"
                          : "bg-blue-50 text-blue-600 border-blue-100"
                      }`}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {ticket.priority}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-gray-700">
                      {ticket.resourceId || "N/A"}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {ticket.contactDetails}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() =>
                        navigate(`/technician/ticket/${ticket.tid}`)
                      }
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-primary-600 hover:border-primary-200 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <ClipboardList className="w-12 h-12 opacity-20" />
                      <p className="italic font-medium">
                        No tasks found in this category.
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
  );
}

/* --- UI Components --- */

function StatMiniCard({ label, value, color, icon: Icon }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
  };

  return (
    <div
      className={`flex items-center gap-4 px-5 py-3 rounded-2xl border ${colors[color]} min-w-[140px]`}
    >
      <div className="p-2 rounded-lg bg-white/50">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase opacity-60 leading-none mb-1">
          {label}
        </p>
        <p className="text-xl font-black leading-none">{value}</p>
      </div>
    </div>
  );
}
