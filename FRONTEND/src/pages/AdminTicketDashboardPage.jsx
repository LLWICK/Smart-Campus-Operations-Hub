import { useState, useEffect } from "react";
import { adminApi } from "../api/admiTApi";
import {
  Search,
  Wrench,
  Clock,
  CheckCircle2,
  UserCheck,
  AlertCircle,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import StatusBadge from "../components/common/StatusBadge"; // Reuse your badge component

export default function AdminTicketDashboard() {
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketData, userData] = await Promise.all([
        adminApi.getAllTickets(),
        adminApi.getUsers(),
      ]);
      setTickets(ticketData);
      // Filter only technicians for the assignment dropdown
      setTechnicians(
        userData.filter((u) => u.role?.toLowerCase() === "technician"),
      );
    } catch (err) {
      toast.error(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (ticketId, techId) => {
    try {
      await adminApi.assignTechnician(ticketId, techId);
      toast.success("Technician assigned successfully");
      loadData(); // Refresh to show status change (to IN_PROGRESS)
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
      toast.error("Status update failed");
    }
  };

  const filteredTickets = tickets.filter(
    (t) =>
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tid?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Ticket Dispatch Center
        </h1>
        <p className="text-gray-500 mt-1">
          Assign technicians and monitor support request lifecycle
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/30">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 bg-white"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>{filteredTickets.length} Tickets Found</span>
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-20 text-center text-gray-400">
            Loading support requests...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Ticket Details</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4">Assign Technician</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.tid}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Description & ID */}
                    <td className="px-6 py-4">
                      <div className="max-w-[250px]">
                        <p className="font-semibold text-gray-900 truncate">
                          {ticket.description}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase mt-1 tracking-wider">
                          ID: {ticket.tid.substring(0, 8)}
                        </p>
                      </div>
                    </td>

                    {/* Badge */}
                    <td className="px-6 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>

                    {/* Assignment Dropdown */}
                    <td className="px-6 py-4">
                      <div className="relative group">
                        <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <select
                          className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer hover:border-primary-300 transition-colors"
                          value={ticket.assignedToTechnicianId || ""}
                          onChange={(e) =>
                            handleAssign(ticket.tid, e.target.value)
                          }
                        >
                          <option value="">Choose Technician...</option>
                          {technicians.map((tech) => (
                            <option key={tech.id} value={tech.id}>
                              {tech.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            handleStatusUpdate(ticket.tid, "IN_PROGRESS")
                          }
                          className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                          title="Set to In Progress"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(ticket.tid, "RESOLVED")
                          }
                          className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                          title="Mark Resolved"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
