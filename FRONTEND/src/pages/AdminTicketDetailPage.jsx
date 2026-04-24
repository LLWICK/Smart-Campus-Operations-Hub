import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Tag,
  MessageSquare,
  Wrench,
  Phone,
  Clock,
  UserCheck,
  RotateCcw,
  ShieldCheck,
  Hash,
  ExternalLink,
  Send,
  MessageSquareQuote,
  HardHat,
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

// APIs
import { ticketApi } from "../api/ticketAPI";
import { adminApi } from "../api/admiTApi"; // Ensure name is correct
import StatusBadge from "../components/common/StatusBadge";

export default function AdminTicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  // New States for responses
  const [adminNote, setAdminNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketRes, usersRes] = await Promise.all([
        ticketApi.getById(id),
        adminApi.getUsers(),
      ]);

      setTicket(ticketRes.data);
      setAdminNote(ticketRes.data.adminResponse || ""); // Sync text area with DB
      setTechnicians(
        usersRes.filter((u) => u.role?.toLowerCase() === "technician"),
      );
    } catch (err) {
      toast.error("Ticket not found or access denied");
      navigate("/admin-dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (techId) => {
    if (!techId) return;
    try {
      await adminApi.assignTechnician(ticket.tid, techId);
      toast.success("Technician assigned & Work Started");
      fetchData();
    } catch (err) {
      toast.error("Assignment failed");
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await adminApi.updateTicketStatus(ticket.tid, status);
      toast.success(`Workflow moved to ${status}`);
      fetchData();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleSaveAdminResponse = async () => {
    if (!adminNote.trim()) return toast.error("Response cannot be empty");
    try {
      setIsSubmitting(true);
      await adminApi.updateAdminResponse(ticket.tid, adminNote);
      toast.success("Official response updated and visible to user");
      fetchData();
    } catch (err) {
      toast.error("Failed to save response");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin"></div>
          <Wrench className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary-600" />
        </div>
      </div>
    );

  if (!ticket) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-gray-500 hover:text-primary-600 font-bold text-sm transition-all"
        >
          <div className="p-2 rounded-full group-hover:bg-primary-50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Dashboard
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-1.5 rounded-2xl border border-amber-100 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">
              Admin Oversight Mode
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Ticket Info Card */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <StatusBadge status={ticket.status} />
                  <span className="flex items-center gap-1 text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    <Hash className="w-3 h-3" /> {ticket.tid.substring(0, 12)}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                  {ticket.category.replace("_", " ")}
                </h1>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Submission Date
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  {format(new Date(ticket.createdAt), "PPP")}
                </p>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="flex flex-wrap gap-3">
                <DetailTag
                  icon={User}
                  label="Requester"
                  value={ticket.raisedByUserId}
                />
                <DetailTag
                  icon={Tag}
                  label="Priority"
                  value={ticket.priority}
                  highlight={
                    ticket.priority === "HIGH" || ticket.priority === "CRITICAL"
                  }
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 font-black text-xs text-gray-400 uppercase tracking-widest">
                  <MessageSquare className="w-4 h-4 text-primary-500" /> Issue
                  Description
                </div>
                <div className="bg-gray-50/50 rounded-3xl p-6 text-gray-700 leading-relaxed border border-gray-100 text-lg italic">
                  "{ticket.description}"
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoBox
                  icon={Phone}
                  label="Callback Info"
                  value={ticket.contactDetails}
                />
                <InfoBox
                  icon={ExternalLink}
                  label="Resource / Room"
                  value={ticket.resourceId || "Not Specified"}
                />
              </div>
            </div>
          </div>

          {/* NEW: Feedback Hub Section */}
          <div className="grid grid-cols-1 gap-6">
            {/* Editable Admin Response */}
            <div className="bg-white rounded-[2.5rem] border-2 border-primary-50 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-primary-50/50 border-b border-primary-100 flex items-center gap-2">
                <MessageSquareQuote className="w-5 h-5 text-primary-600" />
                <h2 className="font-black text-primary-900 uppercase text-xs tracking-widest">
                  Official Admin Response
                </h2>
              </div>
              <div className="p-8 space-y-4">
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Tell the student/lecturer what's happening..."
                  className="w-full h-32 p-6 bg-gray-50 border border-gray-200 rounded-3xl text-gray-700 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all resize-none italic"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveAdminResponse}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Update Response"}
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Read-Only Technician Feedback */}
            <div className="bg-gray-900 rounded-[2.5rem] border border-gray-800 p-8 text-white shadow-2xl relative overflow-hidden">
              <HardHat className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 -rotate-12" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Wrench className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-xs uppercase tracking-widest text-emerald-400">
                    Technical Log
                  </h3>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl italic text-gray-300 min-h-[80px]">
                  {ticket.technicianFeedback ||
                    "No technical notes have been logged by the technician yet."}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Control Panel (Right Sidebar) */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-lg shadow-gray-200/30 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-gray-900 text-sm uppercase tracking-tighter">
                Technician Force
              </h3>
              <UserCheck className="w-5 h-5 text-primary-600" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                Assign Responsible Staff
              </label>
              <select
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary-500/10 outline-none appearance-none cursor-pointer transition-all"
                value={ticket.assignedToTechnicianId || ""}
                onChange={(e) => handleAssign(e.target.value)}
              >
                <option value="">Pending Assignment...</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    🛠️ {tech.name}
                  </option>
                ))}
              </select>
            </div>

            {ticket.assignedToTechnicianId && (
              <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl border border-primary-100">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xs">
                  {ticket.assignedToTechnicianId.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-primary-700 uppercase">
                    Current Handler
                  </p>
                  <p className="text-xs font-bold text-primary-900">
                    {ticket.assignedToTechnicianId}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-900 rounded-[2rem] p-6 shadow-xl space-y-4">
            <h3 className="font-black text-primary-400 text-xs uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Workflow Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <ActionButton
                label="Mark as Resolved"
                color="bg-emerald-500 hover:bg-emerald-400 text-white"
                onClick={() => handleStatusUpdate("RESOLVED")}
              />
              <ActionButton
                label="Archive & Close"
                color="bg-white/10 hover:bg-white/20 text-white border border-white/10"
                onClick={() => handleStatusUpdate("CLOSED")}
              />
              <button
                onClick={() => handleStatusUpdate("OPEN")}
                className="group flex items-center justify-center gap-2 w-full py-4 bg-transparent hover:bg-amber-500/10 rounded-2xl text-xs font-bold text-amber-500 border border-amber-500/30 transition-all"
              >
                <RotateCcw className="w-3 h-3 group-hover:rotate-[-45deg] transition-transform" />
                Re-Open Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components kept for clean code
function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className="p-5 border border-gray-100 rounded-[1.5rem] bg-white flex gap-4 items-center group hover:border-primary-200 transition-colors">
      <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-sm font-black text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function DetailTag({ icon: Icon, label, value, highlight }) {
  return (
    <div
      className={`px-4 py-2 rounded-full text-[11px] font-black flex items-center gap-2 border transition-all ${
        highlight
          ? "bg-red-50 text-red-600 border-red-100 animate-pulse"
          : "bg-white text-gray-600 border-gray-200 shadow-sm"
      }`}
    >
      <Icon
        className={`w-3.5 h-3.5 ${highlight ? "text-red-500" : "text-gray-400"}`}
      />
      <span className="uppercase opacity-60">{label}:</span>
      <span className="uppercase">{value}</span>
    </div>
  );
}

function ActionButton({ label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-4 ${color} rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-black/5`}
    >
      {label}
    </button>
  );
}
