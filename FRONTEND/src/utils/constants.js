export const FACILITY_TYPES = [
  { value: 'LECTURE_HALL', label: 'Lecture Hall' },
  { value: 'LAB', label: 'Laboratory' },
  { value: 'MEETING_ROOM', label: 'Meeting Room' },
  { value: 'EQUIPMENT', label: 'Equipment' },
];

export const FACILITY_STATUS = {
  ACTIVE: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  OUT_OF_SERVICE: { label: 'Out of Service', color: 'bg-red-100 text-red-700' },
};

export const BOOKING_STATUS = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  APPROVED: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600' },
};

export const FACILITY_TYPE_ICONS = {
  LECTURE_HALL: 'GraduationCap',
  LAB: 'FlaskConical',
  MEETING_ROOM: 'Users',
  EQUIPMENT: 'Monitor',
};

