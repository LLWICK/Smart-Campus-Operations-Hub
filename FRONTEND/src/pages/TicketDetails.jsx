import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  MessageSquare,
  XCircle,
  Copy,
  CheckCircle2,
  Pencil,
  AlertCircle,
  LifeBuoy,
} from "lucide-react";
import toast from "react-hot-toast";
import { ticketApi } from "../api/ticketApi"; // Assuming you rename your API utility
import StatusBadge from "../components/common/StatusBadge";
import ConfirmModal from "../components/common/ConfirmModal";
import { SkeletonBox } from "../components/common/Skeleton";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [closeModal, setCloseModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchTicket() {
      try {
        const res = await ticketApi.getById(id);
        setTicket(res.data);
      } catch {
        toast.error("Ticket not found");
        navigate("/tickets");
      } finally {
        setLoading(false);
      }
    }
    fetchTicket();
  }, [id, navigate]);

  const handleCloseTicket = async () => {
    try {
      await ticketApi.updateStatus(id, "CLOSED");
      toast.success("Ticket closed successfully");
      setCloseModal(false);
      const res = await ticketApi.getById(id);
      setTicket(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to close ticket");
    }
  };

  const copyTicketId = () => {
    navigator.clipboard.writeText(ticket.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Ticket ID copied");
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <SkeletonBox className="h-5 w-16" />
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-8 space-y-4">
            <SkeletonBox className="h-6 w-24" />
            <SkeletonBox className="h-8 w-64" />
            <div className="grid grid-cols-2 gap-4 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonBox key={i} className="h-20" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const isOwnerOrAdmin =
    user?.role === "admin" || user?.userId === ticket.userId;
  const canClose = isOwnerOrAdmin && ticket.status !== "CLOSED";
  const canEdit = isOwnerOrAdmin && ticket.status === "OPEN";

  const statusConfig = {
    OPEN: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      msg: "Ticket is open and active",
    },
    IN_PROGRESS: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
      msg: "Support is looking into this",
    },
    RESOLVED: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-800",
      msg: "Issue has been marked as resolved",
    },
    CLOSED: {
      bg: "bg-gray-50",
      border: "border-gray-200",
      text: "text-gray-600",
      msg: "This ticket is closed",
    },
  };

  const sc = statusConfig[ticket.status] || statusConfig.OPEN;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Support
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {/* Status Banner */}
        <div className={`px-6 sm:px-8 py-4 ${sc.bg} border-b ${sc.border}`}>
          <div className="flex items-center gap-3">
            <StatusBadge status={ticket.status} />
            <span className={`text-sm font-medium ${sc.text}`}>{sc.msg}</span>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {ticket.subject}
              </h1>
              <button
                onClick={copyTicketId}
                className="mt-1 text-xs text-gray-400 hover:text-gray-600 inline-flex items-center gap-1.5 transition-colors"
              >
                #{ticket.id.slice(-8)}
                {copied ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-3">
              {canEdit && (
                <Link
                  to={`/tickets/${ticket.id}/edit`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-xl hover:bg-primary-100 transition-all"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Ticket
                </Link>
              )}
              {canClose && (
                <button
                  onClick={() => setCloseModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  Close Ticket
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 pb-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Tag, label: "Category", value: ticket.category },
              { icon: AlertCircle, label: "Priority", value: ticket.priority },
              { icon: User, label: "Requested By", value: ticket.userName },
              {
                icon: Calendar,
                label: "Submitted On",
                value: format(new Date(ticket.createdAt), "MMM dd, yyyy"),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"
              >
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <item.icon className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Issue Description
                </p>
                <p className="text-sm text-gray-900 leading-relaxed">
                  {ticket.description}
                </p>
              </div>
            </div>
          </div>

          {ticket.resolution && (
            <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200">
              <div className="flex items-start gap-3">
                <LifeBuoy className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-emerald-700 mb-1">
                    Official Resolution
                  </p>
                  <p className="text-sm text-emerald-800 leading-relaxed">
                    {ticket.resolution}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-400">
              Last updated:{" "}
              {format(new Date(ticket.updatedAt), "MMM dd, yyyy HH:mm")}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={closeModal}
        onClose={() => setCloseModal(false)}
        onConfirm={handleCloseTicket}
        title="Close Support Ticket"
        message="Are you sure you want to close this ticket? This signifies the issue has been resolved."
        confirmText="Close Ticket"
        variant="danger"
      />
    </div>
  );
}
