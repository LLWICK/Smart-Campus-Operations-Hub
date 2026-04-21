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
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

// Import local data
import { DUMMY_TICKETS } from "../dummy_data/ticket";
import StatusBadge from "../components/common/StatusBadge";
import ConfirmModal from "../components/common/ConfirmModal";

export default function TicketDetailPage() {
  const { id } = useParams(); // Matches the :id in your Route
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [closeModal, setCloseModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Simulate API fetch by finding ticket by tid
    const found = DUMMY_TICKETS.find((t) => t.tid === id);
    if (found) {
      setTicket(found);
    } else {
      toast.error("Ticket not found");
      navigate("/tickets");
    }
  }, [id, navigate]);

  const copyTicketId = () => {
    navigator.clipboard.writeText(ticket.tid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("ID copied to clipboard");
  };

  const handleCloseTicket = () => {
    setTicket((prev) => ({ ...prev, status: "CLOSED" }));
    setCloseModal(false);
    toast.success("Ticket marked as closed");
  };

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
                {format(new Date(ticket.updatedAt), "MMM dd, HH:mm")}
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
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {ticket.category.replace("_", " ")} Inquiry
                </h1>
                <p className="mt-2 text-gray-500">
                  Submitted on {format(new Date(ticket.createdAt), "PPPP")}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-900 font-bold">
                  <MessageSquare className="w-5 h-5 text-primary-500" />
                  <h2>Problem Description</h2>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 text-gray-700 leading-relaxed border border-gray-100">
                  {ticket.description}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailCard
                  icon={Phone}
                  label="Contact Details"
                  value={ticket.contactDetails}
                />
                <DetailCard
                  icon={Tag}
                  label="Linked Resource ID"
                  value={ticket.resourceId}
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
                  variant={ticket.priority === "High" ? "red" : "blue"}
                />
                <SidebarItem
                  icon={User}
                  label="Raised By"
                  value={`ID: ${ticket.raisedByUserId}`}
                />
                <SidebarItem
                  icon={Wrench}
                  label="Technician"
                  value={ticket.assignedToTechnicianId || "Waiting Assignment"}
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
        message="Are you sure this issue is resolved? Closing the ticket will notify the requester."
        confirmText="Yes, Close Ticket"
        variant="danger"
      />
    </div>
  );
}

// Sub-components for cleaner code
function DetailCard({ icon: Icon, label, value }) {
  return (
    <div className="p-4 border border-gray-100 rounded-2xl flex gap-4 items-start">
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
