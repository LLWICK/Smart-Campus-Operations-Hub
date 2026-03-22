import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { facilityApi } from '../api/facilityApi';
import FacilityForm from '../components/facilities/FacilityForm';
import StatusBadge from '../components/common/StatusBadge';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmModal from '../components/common/ConfirmModal';

const typeLabels = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Laboratory',
  MEETING_ROOM: 'Meeting Room',
  EQUIPMENT: 'Equipment',
};

export default function ManageFacilitiesPage() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await facilityApi.getAll();
      setFacilities(res.data);
    } catch (err) {
      toast.error('Failed to load facilities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleCreate = async (data) => {
    await facilityApi.create(data);
    toast.success('Facility created successfully');
    fetchFacilities();
  };

  const handleUpdate = async (data) => {
    await facilityApi.update(editingFacility.id, data);
    toast.success('Facility updated successfully');
    setEditingFacility(null);
    fetchFacilities();
  };

  const handleDelete = async () => {
    try {
      await facilityApi.delete(deleteModal.id);
      toast.success('Facility deleted');
      setDeleteModal({ open: false, id: null });
      fetchFacilities();
    } catch {
      toast.error('Failed to delete facility');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await facilityApi.toggleStatus(id);
      toast.success('Status updated');
      fetchFacilities();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const openEdit = (facility) => {
    setEditingFacility(facility);
    setFormOpen(true);
  };

  const openCreate = () => {
    setEditingFacility(null);
    setFormOpen(true);
  };

  if (loading) return <LoadingSpinner message="Loading facilities..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Facilities"
        description="Add, edit, and manage campus facilities"
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Facility
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Facility
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {facilities.map((facility) => (
                <tr key={facility.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{facility.name}</p>
                    {facility.description && (
                      <p className="text-xs text-gray-500 truncate max-w-xs mt-0.5">
                        {facility.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {typeLabels[facility.type]}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{facility.capacity}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{facility.location}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={facility.status} type="facility" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggleStatus(facility.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        title={facility.status === 'ACTIVE' ? 'Set Out of Service' : 'Set Active'}
                      >
                        {facility.status === 'ACTIVE' ? (
                          <ToggleRight className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(facility)}
                        className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, id: facility.id })}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {facilities.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            No facilities yet. Click "Add Facility" to create one.
          </div>
        )}
      </div>

      <FacilityForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingFacility(null);
        }}
        onSubmit={editingFacility ? handleUpdate : handleCreate}
        initialData={editingFacility}
      />

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Facility"
        message="Are you sure you want to delete this facility? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
