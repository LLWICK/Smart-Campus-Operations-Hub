import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Wrench,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Send,
  Loader2,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

// APIs
import { ticketApi } from "../api/ticketAPI";
import { technicianApi } from "../api/technicianAPI";
import StatusBadge from "../components/common/StatusBadge";

export default function TechnicianResolutionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const response = await ticketApi.getById(id);
      setTicket(response.data);
      // Pre-fill feedback if it already exists
      if (response.data.technicianFeedback) {
        setFeedback(response.data.technicianFeedback);
      }
    } catch (err) {
      toast.error("Could not load ticket details");
      navigate("/technician-dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResolution = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return toast.error("Please enter resolution details");

    try {
      setSubmitting(true);
      // Calls the Java API we built: PATCH /api/technician/tickets/{id}/resolve
      await technicianApi.resolveTask(id, feedback);

      toast.success("Resolution logged and ticket resolved!");
      navigate("/technician-dashboard");
    } catch (err) {
      toast.error(
        "Failed to update ticket: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartWork = async () => {
    try {
      await technicianApi.updateTaskStatus(id, "IN_PROGRESS");
      setTicket({ ...ticket, status: "IN_PROGRESS" });
      toast.success("Status updated to In Progress");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Work Queue
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Ticket Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-xl shadow-gray-200/50">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-black text-gray-900 capitalize">
                  {ticket.category.replace("_", " ")}
                </h1>
                <p className="text-gray-400 font-mono text-sm">
                  Ticket ID: {ticket.tid}
                </p>
              </div>
              <StatusBadge status={ticket.status} />
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> User Description
                </h3>
                <div className="p-4 bg-gray-50 rounded-2xl text-gray-700 leading-relaxed border border-gray-100">
                  {ticket.description}
                </div>
              </section>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase">
                    Resource ID
                  </p>
                  <p className="font-bold text-gray-800">
                    {ticket.resourceId || "N/A"}
                  </p>
                </div>
                <div className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase">
                    Contact
                  </p>
                  <p className="font-bold text-gray-800">
                    {ticket.contactDetails}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resolution Form */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-xl shadow-gray-200/50">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              Technical Resolution Log
            </h2>

            <form onSubmit={handleSubmitResolution} className="space-y-4">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Describe exactly what was done to fix this issue (this will be visible to the student)..."
                className="w-full h-40 p-5 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none resize-none font-medium text-gray-700"
              />

              <div className="flex justify-end gap-3">
                {ticket.status === "OPEN" && (
                  <button
                    type="button"
                    onClick={handleStartWork}
                    className="px-6 py-3 rounded-xl border border-amber-200 text-amber-600 font-bold hover:bg-amber-50 transition-all flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Mark as In Progress
                  </button>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submit & Resolve Ticket
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Metadata */}
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-[2rem] p-6 text-white space-y-6">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${ticket.priority === "HIGH" ? "bg-red-500" : "bg-blue-500"}`}
              >
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400">
                  Task Priority
                </p>
                <p className="font-bold uppercase tracking-widest">
                  {ticket.priority}
                </p>
              </div>
            </div>

            <hr className="border-gray-800" />

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 mb-1">
                  Assigned To
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold">
                    <Wrench className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold">Technician (You)</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 mb-1">
                  Created Date
                </p>
                <p className="text-sm font-medium">
                  {ticket.createdAt
                    ? format(new Date(ticket.createdAt), "PPP p")
                    : "Unknown"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
