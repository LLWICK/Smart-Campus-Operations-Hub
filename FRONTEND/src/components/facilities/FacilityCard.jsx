import { Link } from 'react-router-dom';
import { MapPin, Users, Clock, GraduationCap, FlaskConical, Monitor, Users as UsersIcon } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const typeIcons = {
  LECTURE_HALL: GraduationCap,
  LAB: FlaskConical,
  MEETING_ROOM: UsersIcon,
  EQUIPMENT: Monitor,
};

const typeLabels = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Laboratory',
  MEETING_ROOM: 'Meeting Room',
  EQUIPMENT: 'Equipment',
};

export default function FacilityCard({ facility }) {
  const Icon = typeIcons[facility.type] || Monitor;

  return (
    <Link
      to={`/facilities/${facility.id}`}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300"
    >
      <div className="h-40 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center relative">
        <Icon className="w-16 h-16 text-primary-300 group-hover:scale-110 transition-transform duration-300" />
        <div className="absolute top-3 right-3">
          <StatusBadge status={facility.status} type="facility" />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {facility.name}
            </h3>
            <p className="text-xs text-primary-600 font-medium mt-0.5">
              {typeLabels[facility.type]}
            </p>
          </div>
        </div>

        {facility.description && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">{facility.description}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{facility.capacity} capacity</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{facility.location}</span>
          </div>
          {facility.availabilityStart && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{facility.availabilityStart} - {facility.availabilityEnd}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
