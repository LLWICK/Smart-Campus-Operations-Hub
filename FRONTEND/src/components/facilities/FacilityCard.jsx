import { Link } from 'react-router-dom';
import { MapPin, Users, Clock, GraduationCap, FlaskConical, Monitor, Users as UsersIcon } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const typeConfig = {
  LECTURE_HALL: { icon: GraduationCap, label: 'Lecture Hall', gradient: 'from-blue-50 to-indigo-100', accent: 'text-blue-600' },
  LAB: { icon: FlaskConical, label: 'Laboratory', gradient: 'from-purple-50 to-violet-100', accent: 'text-purple-600' },
  MEETING_ROOM: { icon: UsersIcon, label: 'Meeting Room', gradient: 'from-emerald-50 to-teal-100', accent: 'text-emerald-600' },
  EQUIPMENT: { icon: Monitor, label: 'Equipment', gradient: 'from-amber-50 to-orange-100', accent: 'text-amber-600' },
};

export default function FacilityCard({ facility }) {
  const config = typeConfig[facility.type] || typeConfig.EQUIPMENT;
  const Icon = config.icon;

  return (
    <Link
      to={`/facilities/${facility.id}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1"
    >
      <div className={`h-40 bg-gradient-to-br ${config.gradient} flex items-center justify-center relative overflow-hidden`}>
        <Icon className="w-16 h-16 text-gray-300/60 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" />
        <div className="absolute top-3 right-3">
          <StatusBadge status={facility.status} type="facility" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/60 to-transparent" />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
              {facility.name}
            </h3>
            <p className={`text-xs font-semibold mt-0.5 ${config.accent}`}>
              {config.label}
            </p>
          </div>
        </div>

        {facility.description && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">{facility.description}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <span>{facility.capacity}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span>{facility.location}</span>
          </div>
          {facility.availabilityStart && (
            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{facility.availabilityStart} - {facility.availabilityEnd}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
