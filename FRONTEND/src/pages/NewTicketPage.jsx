import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CalendarPlus,
  AlertTriangle,
  User,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";

import { ticketApi } from "../api/ticketApi";
import { facilityApi } from "../api/facilityApi";

export default function NewTicketPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [facilities, setFacilities] = useState([]);

  const [form, setForm] = useState({
    category: "Technical",
    priority: "LOW",
    resourceId: "",
    description: "",
    contactDetails: "",
  });

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await facilityApi.getAll();
        setFacilities(response.data.filter((f) => f.status === "ACTIVE"));
      } catch (err) {
        console.error("Failed to load facilities", err);
      }
    };
    fetchFacilities();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (!form.category || !form.resourceId) {
      toast.error("Please select a category and the affected facility");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      /**
       * We send the form as-is.
       * Note: 'raisedByUserId' is excluded here because your
       * Controller now injects it from the @AuthenticationPrincipal.
       */
      await ticketApi.create(form);

      toast.success("Ticket raised successfully!");
      navigate("/tickets");
    } catch (err) {
      console.error("Submission Error:", err.response?.data);
      const serverMessage = err.response?.data?.message || "Validation Error";

      // Detailed logging for field errors if they exist
      if (err.response?.data?.fieldErrors) {
        console.table(err.response.data.fieldErrors);
      }

      toast.error(`Submission failed: ${serverMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { label: "Technical", value: "Technical" },
    { label: "Non-Technical", value: "Non_Technical" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center gap-3 px-2">
        {[
          { num: 1, label: "Classification" },
          { num: 2, label: "Description" },
        ].map((s, i, arr) => (
          <div key={s.num} className="flex items-center gap-3 flex-1">
            <div
              className={`flex items-center gap-2 ${step >= s.num ? "text-primary-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step > s.num
                    ? "bg-primary-600 text-white"
                    : step === s.num
                      ? "bg-primary-100 text-primary-700 ring-2 ring-primary-600"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                {s.label}
              </span>
            </div>
            {i < arr.length - 1 && (
              <div
                className={`flex-1 h-0.5 rounded ${step > s.num ? "bg-primary-600" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="px-6 sm:px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                New Support Ticket
              </h1>
              <p className="text-sm text-gray-500">
                The technician will be notified immediately
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Issue Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleChange("category", cat.value)}
                      className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                        form.category === cat.value
                          ? "bg-primary-600 border-primary-600 text-white"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => handleChange("priority", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Facility
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      required
                      value={form.resourceId}
                      onChange={(e) =>
                        handleChange("resourceId", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white"
                    >
                      <option value="">Select Location...</option>
                      {facilities.map((f) => (
                        <option key={f.id} value={f.name}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Problem Description
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Provide as much detail as possible..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Contact Number / Extension
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={form.contactDetails}
                    onChange={(e) =>
                      handleChange("contactDetails", e.target.value)
                    }
                    placeholder="e.g. Ext 402 or 077..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl"
            >
              Back
            </button>
          )}
          <button
            type={step === 1 ? "button" : "submit"}
            onClick={step === 1 ? handleNext : undefined}
            disabled={submitting}
            className="flex-1 px-4 py-3 text-sm font-bold rounded-xl bg-primary-600 text-white disabled:opacity-50"
          >
            {submitting
              ? "Processing..."
              : step === 1
                ? "Next"
                : "Submit Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
