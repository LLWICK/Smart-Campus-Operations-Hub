import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  MessageSquare,
  XCircle,
  Copy,
  CheckCircle2,
  Wrench,
  Layers,
  AlertTriangle,
  Phone,
  Clock,
  MessageSquareQuote,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

// APIs
import { ticketApi } from "../api/ticketAPI";
import StatusBadge from "../components/common/StatusBadge";
import ConfirmModal from "../components/common/ConfirmModal";

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [closeModal, setCloseModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const response = await ticketApi.getById(id);
      setTicket(response.data);
    } catch (err) {
      toast.error(err.message || "Ticket not found");
      navigate("/tickets");
    } finally {
      setLoading(false);
    }
  };

  const copyTicketId = () => {
    navigator.clipboard.writeText(ticket.tid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("ID copied to clipboard");
  };

  const handleCloseTicket = async () => {
    try {
      await ticketApi.updateStatus(ticket.tid, "CLOSED");
      setTicket((prev) => ({ ...prev, status: "CLOSED" }));
      setCloseModal(false);
      toast.success("Ticket marked as closed");
    } catch (err) {
      toast.error("Failed to close ticket: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );

  if (!ticket) return null;

  const statusStyles = {
    OPEN: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
    },
    IN_PROGRESS: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
    },
    CLOSED: {
      bg: "bg-gray-50",
      border: "border-gray-200",
      text: "text-gray-600",
    },
    RESOLVED: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-800",
    },
  };

  const sc = statusStyles[ticket.status] || statusStyles.OPEN;

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6 animate-in fade-in duration-500">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Tickets
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        {/* Status Banner */}
        <div
          className={`px-8 py-4 ${sc.bg} border-b ${sc.border} flex flex-wrap justify-between items-center gap-4`}
        >
          <div className="flex items-center gap-4">
            <StatusBadge status={ticket.status} />
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Clock className="w-4 h-4" />
              <span>
                Last updated{" "}
                {ticket.updatedAt
                  ? format(new Date(ticket.updatedAt), "MMM dd, HH:mm")
                  : "Recently"}
              </span>
            </div>
          </div>
          <button
            onClick={copyTicketId}
            className="px-3 py-1 bg-white/50 hover:bg-white rounded-lg border border-black/5 text-xs font-mono text-gray-600 flex items-center gap-2 transition-all"
          >
            {ticket.tid}
            {copied ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <div className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Content */}
            <div className="flex-1 space-y-8">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight capitalize">
                  {ticket.category.toLowerCase().replace("_", " ")} Inquiry
                </h1>
                <p className="mt-2 text-gray-500">
                  Submitted on{" "}
                  {ticket.createdAt
                    ? format(new Date(ticket.createdAt), "PPPP")
                    : "Date Unknown"}
                </p>
              </div>

              {/* Problem Description */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-900 font-bold">
                  <MessageSquare className="w-5 h-5 text-primary-500" />
                  <h2>Problem Description</h2>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 text-gray-700 leading-relaxed border border-gray-100">
                  {ticket.description}
                </div>
              </div>

              {/* RESOLUTION SECTION: Show when Admin or Tech provides feedback */}
              {(ticket.adminResponse || ticket.technicianFeedback) && (
                <div className="space-y-4 pt-6 border-t border-gray-100 animate-in slide-in-from-top-2 duration-700">
                  <div className="flex items-center gap-2 text-gray-900 font-bold">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <h2>Official Updates & Resolution</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Official Admin Response Card */}
                    {ticket.adminResponse && (
                      <div className="bg-primary-50/50 border border-primary-100 rounded-2xl p-6 relative overflow-hidden group hover:bg-primary-50 transition-colors">
                        <ShieldCheck className="absolute -right-2 -top-2 w-12 h-12 text-primary-500/10 rotate-12" />
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquareQuote className="w-4 h-4 text-primary-600" />
                          <span className="text-xs font-black text-primary-700 uppercase tracking-widest">
                            Message from Support Team
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed italic">
                          "{ticket.adminResponse}"
                        </p>
                      </div>
                    )}

                    {/* Technical Feedback Card */}
                    {ticket.technicianFeedback && (
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 relative overflow-hidden group hover:bg-emerald-50 transition-colors">
                        <Wrench className="absolute -right-2 -top-2 w-12 h-12 text-emerald-500/10 -rotate-12" />
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">
                            Technical Work Performed
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed italic">
                          "{ticket.technicianFeedback}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact and Resource Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailCard
                  icon={Phone}
                  label="Contact Details"
                  value={ticket.contactDetails}
                />
                <DetailCard
                  icon={Tag}
                  label="Linked Resource ID"
                  value={ticket.resourceId || "No resource linked"}
                />
              </div>
            </div>

            {/* Right Column: Sidebar Stats */}
            <div className="w-full lg:w-80 space-y-4">
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-6">
                <SidebarItem
                  icon={AlertTriangle}
                  label="Priority"
                  value={ticket.priority}
                  variant={
                    ticket.priority === "HIGH" || ticket.priority === "CRITICAL"
                      ? "red"
                      : "blue"
                  }
                />
                <SidebarItem
                  icon={User}
                  label="Raised By"
                  value={`ID: ${ticket.raisedByUserId?.substring(0, 10)}...`}
                />
                <SidebarItem
                  icon={Wrench}
                  label="Assigned Technician"
                  value={ticket.assignedToTechnicianId || "Awaiting Assignment"}
                />

                <hr className="border-gray-200" />

                {ticket.status !== "CLOSED" && (
                  <button
                    onClick={() => setCloseModal(true)}
                    className="w-full py-3 px-4 bg-white text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-50 hover:border-red-300 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    Close Ticket
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={closeModal}
        onClose={() => setCloseModal(false)}
        onConfirm={handleCloseTicket}
        title="Finalize Ticket"
        message="Are you sure this issue is resolved? Closing the ticket will mark it as complete in your records."
        confirmText="Yes, Close Ticket"
        variant="danger"
      />
    </div>
  );
}

// Helper Components
function DetailCard({ icon: Icon, label, value }) {
  return (
    <div className="p-4 border border-gray-100 rounded-2xl flex gap-4 items-start bg-white shadow-sm">
      <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, value, variant = "gray" }) {
  const colors = {
    red: "text-red-600 bg-red-100",
    blue: "text-blue-600 bg-blue-100",
    gray: "text-gray-600 bg-gray-200",
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${colors[variant] || colors.gray}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
          {label}
        </p>
        <p className="text-sm font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
