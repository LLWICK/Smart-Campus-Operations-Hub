import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2, Clock, CalendarPlus, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { facilityApi } from '../api/facilityApi';
import { bookingApi } from '../api/bookingApi';
import TimeSlotGrid from '../components/bookings/TimeSlotGrid';
import { DEFAULT_USER } from '../utils/constants';
import { format } from 'date-fns';

export default function NewBookingPage() {
  const { facilityId: preselectedFacilityId } = useParams();
  const navigate = useNavigate();

  const [facilities, setFacilities] = useState([]);
  const [form, setForm] = useState({
    facilityId: preselectedFacilityId || '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    purpose: '',
    expectedAttendees: '',
  });
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingBookings, setExistingBookings] = useState([]);
  const [step, setStep] = useState(1);

  useEffect(() => {
    facilityApi.getAll({ status: 'ACTIVE' }).then((res) => setFacilities(res.data));
  }, []);

  useEffect(() => {
    if (form.facilityId && form.date) {
      bookingApi
        .getByFacilityAndDate(form.facilityId, form.date)
        .then((res) =>
          setExistingBookings(
            res.data.filter((b) => b.status !== 'CANCELLED' && b.status !== 'REJECTED')
          )
        )
        .catch(() => setExistingBookings([]));
    } else {
      setExistingBookings([]);
    }
  }, [form.facilityId, form.date]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setAvailability(null);
  };

  const checkAvailability = async () => {
    if (!form.facilityId || !form.date || !form.startTime || !form.endTime) {
      toast.error('Please fill in facility, date, and time');
      return;
    }
    setCheckingAvailability(true);
    try {
      const res = await bookingApi.checkAvailability({
        facilityId: form.facilityId,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
      });
      setAvailability(res.data);
      if (res.data.available) {
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check availability');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        expectedAttendees: parseInt(form.expectedAttendees) || 1,
        userId: DEFAULT_USER.id,
        userName: DEFAULT_USER.name,
      };
      await bookingApi.create(payload);
      toast.success('Booking request submitted successfully!');
      navigate('/bookings');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create booking';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedFacility = facilities.find((f) => f.id === form.facilityId);

  const steps = [
    { num: 1, label: 'Select Slot' },
    { num: 2, label: 'Details' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back
      </button>

      {/* Step Indicator */}
      <div className="flex items-center gap-3 px-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-3 flex-1">
            <button
              onClick={() => s.num < step && setStep(s.num)}
              className={`flex items-center gap-2 ${
                step >= s.num ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step > s.num
                    ? 'bg-primary-600 text-white'
                    : step === s.num
                    ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 rounded transition-colors duration-300 ${
                  step > s.num ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
        <div className="px-6 sm:px-8 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <CalendarPlus className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">New Booking</h1>
              <p className="text-sm text-gray-500">Reserve a campus facility</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Step 1: Facility & Time Selection */}
          <div className={step === 1 ? '' : 'hidden'}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Select Facility <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.facilityId}
                  onChange={(e) => handleChange('facilityId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white transition-shadow"
                >
                  <option value="">Choose a facility...</option>
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} — {f.location} (Cap: {f.capacity})
                    </option>
                  ))}
                </select>
              </div>

              {selectedFacility && (
                <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-primary-700">
                    <strong>{selectedFacility.name}</strong> is available from{' '}
                    <strong>{selectedFacility.availabilityStart}</strong> to{' '}
                    <strong>{selectedFacility.availabilityEnd}</strong>, capacity:{' '}
                    <strong>{selectedFacility.capacity}</strong>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => handleChange('endTime', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                  />
                </div>
              </div>

              {/* Time Slot Visualization */}
              {selectedFacility && form.date && (
                <div className="pt-2">
                  <TimeSlotGrid
                    bookings={existingBookings}
                    facilityStart={selectedFacility.availabilityStart}
                    facilityEnd={selectedFacility.availabilityEnd}
                  />
                </div>
              )}

              {/* Availability Check */}
              <button
                type="button"
                onClick={checkAvailability}
                disabled={checkingAvailability || !form.facilityId}
                className="w-full px-4 py-3.5 text-sm font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded-xl hover:bg-primary-100 transition-all duration-200 disabled:opacity-50 active:scale-[0.99]"
              >
                {checkingAvailability ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
                    Checking...
                  </span>
                ) : (
                  'Check Availability & Continue'
                )}
              </button>

              {availability && (
                <div
                  className={`p-4 rounded-xl flex items-start gap-3 animate-scale-in ${
                    availability.available
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {availability.available ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold text-sm">
                      {availability.available
                        ? 'Time slot is available!'
                        : 'Time slot has conflicts'}
                    </p>
                    {!availability.available && availability.conflictingBookings?.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs">
                        {availability.conflictingBookings.map((b) => (
                          <li key={b.id} className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {b.startTime} - {b.endTime}: {b.purpose} ({b.status})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Booking Details */}
          <div className={step === 2 ? 'animate-slide-in-right' : 'hidden'}>
            <div className="space-y-5">
              {selectedFacility && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Booking Summary</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedFacility.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(form.date), 'EEEE, MMMM dd, yyyy')} &middot; {form.startTime} - {form.endTime}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.purpose}
                  onChange={(e) => handleChange('purpose', e.target.value)}
                  placeholder="Describe the purpose of your booking..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Expected Attendees <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedFacility?.capacity || 9999}
                  value={form.expectedAttendees}
                  onChange={(e) => handleChange('expectedAttendees', e.target.value)}
                  placeholder={`Max: ${selectedFacility?.capacity || '—'}`}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                />
                {selectedFacility && form.expectedAttendees > selectedFacility.capacity && (
                  <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Exceeds facility capacity of {selectedFacility.capacity}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          {step === 1 ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          ) : null}
          {step === 2 && (
            <button
              type="submit"
              disabled={submitting || !form.purpose || !form.expectedAttendees}
              className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md active:scale-[0.99]"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit Booking Request'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
