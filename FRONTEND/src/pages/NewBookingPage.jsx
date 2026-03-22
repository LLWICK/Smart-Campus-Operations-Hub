import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { facilityApi } from '../api/facilityApi';
import { bookingApi } from '../api/bookingApi';
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

  useEffect(() => {
    facilityApi.getAll({ status: 'ACTIVE' }).then((res) => setFacilities(res.data));
  }, []);

  useEffect(() => {
    if (form.facilityId && form.date) {
      bookingApi
        .getByFacilityAndDate(form.facilityId, form.date)
        .then((res) => setExistingBookings(res.data.filter((b) => b.status !== 'CANCELLED' && b.status !== 'REJECTED')))
        .catch(() => setExistingBookings([]));
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
      toast.success('Booking request submitted!');
      navigate('/bookings');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create booking';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedFacility = facilities.find((f) => f.id === form.facilityId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900">New Booking</h1>
        <p className="mt-1 text-sm text-gray-500">Reserve a campus facility</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Facility <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.facilityId}
              onChange={(e) => handleChange('facilityId', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
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
            <div className="p-4 bg-primary-50 rounded-xl text-sm text-primary-700">
              <strong>{selectedFacility.name}</strong> is available from{' '}
              <strong>{selectedFacility.availabilityStart}</strong> to{' '}
              <strong>{selectedFacility.availabilityEnd}</strong>, capacity:{' '}
              <strong>{selectedFacility.capacity}</strong>
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={checkAvailability}
            disabled={checkingAvailability || !form.facilityId}
            className="w-full px-4 py-3 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-xl hover:bg-primary-100 transition-colors disabled:opacity-50"
          >
            {checkingAvailability ? 'Checking...' : 'Check Availability'}
          </button>

          {availability && (
            <div
              className={`p-4 rounded-xl flex items-start gap-3 ${
                availability.available
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {availability.available ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium text-sm">
                  {availability.available
                    ? 'Time slot is available!'
                    : 'Time slot has conflicts'}
                </p>
                {!availability.available && availability.conflictingBookings?.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs">
                    {availability.conflictingBookings.map((b) => (
                      <li key={b.id}>
                        {b.startTime} - {b.endTime}: {b.purpose} ({b.status})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {existingBookings.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Existing bookings for this date:
              </p>
              <div className="space-y-2">
                {existingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between text-xs px-3 py-2 bg-white rounded-lg"
                  >
                    <span className="text-gray-700">
                      {b.startTime} - {b.endTime}: {b.purpose}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${
                        b.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
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
              value={form.expectedAttendees}
              onChange={(e) => handleChange('expectedAttendees', e.target.value)}
              placeholder="Number of expected attendees"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {submitting ? 'Submitting...' : 'Submit Booking Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
