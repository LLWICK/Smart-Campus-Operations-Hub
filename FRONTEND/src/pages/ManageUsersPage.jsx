import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { UserPlus, Search, Shield, Trash2, Mail, Users, Pencil, X, ChevronDown, AlertTriangle, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = ['student', 'lecturer', 'admin', 'technician'];
const DEGREE_PROGRAMS = [
  'Information Technology',
  'Engineering',
  'Business',
  'Science',
  'Other',
];
const SPECIALIZATIONS = [
  { value: 'Electrical', label: 'Electrical Engineer' },
  { value: 'Network', label: 'Network Engineer' },
  { value: 'Hardware', label: 'Hardware Technician' },
  { value: 'Software', label: 'System Administrator' },
  { value: 'Other', label: 'Other Maintenance' },
];

const ROLE_COLORS = {
  admin:      'bg-purple-50 text-purple-700 border-purple-200',
  student:    'bg-blue-50 text-blue-700 border-blue-200',
  lecturer:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  technician: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Filter State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDegree, setFilterDegree] = useState('all');
  const [filterSpeciality, setFilterSpeciality] = useState('all');

  // --- Enroll Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const initialFormState = {
    firstName: '', lastName: '', email: '', role: 'student',
    phoneNumber: '', gender: 'Male', dob: '',
    degreeProgram: 'Information Technology', salary: '', speciality: '',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [enrolling, setEnrolling] = useState(false);

  // --- Edit Modal ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [updating, setUpdating] = useState(false);

  // --- Delete Confirmation ---
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/admin/users', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        toast.error('Failed to load users');
      }
    } catch (err) {
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  // ---- Enroll ----
  const handleEnroll = async (e) => {
    e.preventDefault();
    setEnrolling(true);
    try {
      const res = await fetch('http://localhost:8080/api/admin/users/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(`Successfully enrolled ${formData.email}`);
        setIsModalOpen(false);
        setFormData(initialFormState);
        fetchUsers();
      } else {
        const errorText = await res.text();
        toast.error(errorText || 'Failed to enroll user');
      }
    } catch (err) {
      toast.error('Network error during enrolment');
    } finally {
      setEnrolling(false);
    }
  };

  // ---- Update (frontend logic only for now) ----
  const openEditModal = (user) => {
    // Derive firstName / lastName from the combined "name" field if individual fields are empty
    const nameParts = (user.name || '').trim().split(/\s+/);
    const derivedFirst = nameParts[0] || '';
    const derivedLast = nameParts.slice(1).join(' ') || '';

    // Handle dob — backend may return it as an array [yyyy, mm, dd] or ISO string
    let dobValue = '';
    if (Array.isArray(user.dob)) {
      const [y, m, d] = user.dob;
      dobValue = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    } else if (user.dob) {
      dobValue = String(user.dob).slice(0, 10); // take yyyy-mm-dd portion
    }

    setEditFormData({
      id: user.id,
      firstName: user.firstName || derivedFirst,
      lastName: user.lastName || derivedLast,
      email: user.email || '',
      role: user.role || 'student',
      phoneNumber: user.phoneNumber || '',
      gender: user.gender || 'Male',
      dob: dobValue,
      degreeProgram: user.degreeProgram || 'Information Technology',
      salary: user.salary || '',
      speciality: user.speciality || '',
      identificationNumber: user.identificationNumber || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // TODO: Replace with actual API call when backend is ready
      const res = await fetch(`http://localhost:8080/api/admin/users/${editFormData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        toast.success('User updated successfully');
        setIsEditModalOpen(false);
        setEditFormData(null);
        fetchUsers();
      } else {
        const errorText = await res.text();
        toast.error(errorText || 'Failed to update user');
      }
    } catch (err) {
      toast.error('Network error during update');
    } finally {
      setUpdating(false);
    }
  };

  // ---- Delete (frontend logic only for now) ----
  const openDeleteDialog = (user) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      // TODO: Replace with actual API call when backend is ready
      const res = await fetch(`http://localhost:8080/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(`Deleted ${userToDelete.name || userToDelete.email}`);
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
        fetchUsers();
      } else {
        const errorText = await res.text();
        toast.error(errorText || 'Failed to delete user');
      }
    } catch (err) {
      toast.error('Network error during deletion');
    } finally {
      setDeleting(false);
    }
  };

  // ---- Filtering ----
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.identificationNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role === filterRole;

    const matchesDegree =
      filterDegree === 'all' ||
      filterRole !== 'student' ||
      user.degreeProgram === filterDegree;

    const matchesSpeciality =
      filterSpeciality === 'all' ||
      filterRole !== 'technician' ||
      user.speciality === filterSpeciality;

    return matchesSearch && matchesRole && matchesDegree && matchesSpeciality;
  });

  // ========== Shared Form Fields Component ==========
  const renderFormFields = (data, setData, isEdit = false) => (
    <>
      {/* Role Selection — tabs for enroll, read-only badge for edit */}
      {isEdit ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <div className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border capitalize ${
            ROLE_COLORS[data.role] || 'bg-gray-50 text-gray-700 border-gray-200'
          }`}>
            <Shield className="w-3.5 h-3.5" />
            {data.role}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-50 p-1 rounded-xl">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setData({ ...data, role: r })}
              className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all duration-200 ${
                data.role === r
                  ? 'bg-white text-primary-700 shadow-sm ring-1 ring-gray-200'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {/* ID (read-only in edit mode) */}
      {isEdit && data.identificationNumber && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Identification Number</label>
          <input
            type="text"
            readOnly
            value={data.identificationNumber}
            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 text-gray-500 rounded-xl cursor-not-allowed"
          />
        </div>
      )}

      {/* Common Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text" required
            value={data.firstName}
            onChange={(e) => setData({ ...data, firstName: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 block"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text" required
            value={data.lastName}
            onChange={(e) => setData({ ...data, lastName: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 block"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Google Email Address</label>
          <input
            type="email" required
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            className={`w-full px-4 py-2.5 border text-gray-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 block ${
              isEdit ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-50 border-gray-300'
            }`}
            readOnly={isEdit}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={data.phoneNumber || ''}
            onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 block"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input
            type="date"
            value={data.dob || ''}
            onChange={(e) => setData({ ...data, dob: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 block"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            value={data.gender}
            onChange={(e) => setData({ ...data, gender: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 block"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Dynamic Specific Details — only show fields for the user's role */}
      <div className="space-y-4">
        {data.role === 'student' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Degree Program</label>
            <select
              value={data.degreeProgram}
              onChange={(e) => setData({ ...data, degreeProgram: e.target.value })}
              className="w-full px-4 py-2.5 bg-primary-50/50 border border-primary-200 text-primary-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 block"
            >
              {DEGREE_PROGRAMS.map((dp) => (
                <option key={dp} value={dp}>{dp}</option>
              ))}
            </select>
          </div>
        )}

        {(data.role === 'lecturer' || data.role === 'admin' || data.role === 'technician') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary (Annual)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={data.salary || ''}
                onChange={(e) => setData({ ...data, salary: e.target.value })}
                className="w-full pl-8 pr-4 py-2.5 bg-primary-50/50 border border-primary-200 text-primary-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 block"
                placeholder="e.g. 80000"
              />
            </div>
          </div>
        )}

        {data.role === 'technician' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
            <select
              value={data.speciality || 'Electrical'}
              onChange={(e) => setData({ ...data, speciality: e.target.value })}
              className="w-full px-4 py-2.5 bg-primary-50/50 border border-primary-200 text-primary-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 block"
            >
              {SPECIALIZATIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-500 mt-1">Enroll users explicitly to enable Google OAuth login</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition duration-150 active:scale-95 shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Enroll User
        </button>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-200 flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center">
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Text Search */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 focus:border-primary-600 bg-gray-50/50"
              />
            </div>

            {/* Role Dropdown Filter */}
            <div className="relative">
              <select
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  if (e.target.value !== 'student') setFilterDegree('all');
                  if (e.target.value !== 'technician') setFilterSpeciality('all');
                }}
                className="appearance-none pl-4 pr-9 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 focus:border-primary-600 bg-gray-50/50 cursor-pointer min-w-[140px]"
              >
                <option value="all">All Roles</option>
                {ROLES.map((r) => (
                  <option key={r} value={r} className="capitalize">
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Degree Program Dropdown (only when filtering by student) */}
            {filterRole === 'student' && (
              <div className="relative animate-fade-in">
                <select
                  value={filterDegree}
                  onChange={(e) => setFilterDegree(e.target.value)}
                  className="appearance-none pl-4 pr-9 py-2 border border-blue-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/50 cursor-pointer min-w-[180px]"
                >
                  <option value="all">All Programs</option>
                  {DEGREE_PROGRAMS.map((dp) => (
                    <option key={dp} value={dp}>{dp}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" />
              </div>
            )}

            {/* Specialization Dropdown (only when filtering by technician) */}
            {filterRole === 'technician' && (
              <div className="relative animate-fade-in">
                <select
                  value={filterSpeciality}
                  onChange={(e) => setFilterSpeciality(e.target.value)}
                  className="appearance-none pl-4 pr-9 py-2 border border-amber-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50/50 cursor-pointer min-w-[200px]"
                >
                  <option value="all">All Specializations</option>
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 shrink-0">
            <Users className="w-4 h-4" />
            <span className="font-medium text-gray-900">{filteredUsers.length}</span> Active Users
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="px-6 py-12 flex justify-center text-gray-400">Loading directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                      {/* ID */}
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                          <Hash className="w-3 h-3" />
                          {user.identificationNumber || '—'}
                        </div>
                      </td>
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=0D8ABC&color=fff`}
                            alt=""
                            className="w-9 h-9 rounded-full bg-gray-100 object-cover border border-gray-200"
                          />
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      {/* Role */}
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${ROLE_COLORS[user.role] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                          <Shield className="w-3 h-3" />
                          {user.role}
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        {user.providerId ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Pending Login
                          </span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(user)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium transition-colors"
                            title="Edit user"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteDialog(user)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================== ENROLL MODAL ==================== */}
      {isModalOpen && createPortal(
        <div className="relative z-50" aria-modal="true">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8 my-8 animate-fade-in">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-2xl font-bold text-gray-900">Enroll New User</h3>
                <p className="text-sm text-gray-500 mt-1 mb-6">
                  Select user category and fill out their details.
                </p>
                <form onSubmit={handleEnroll} className="space-y-6">
                  {renderFormFields(formData, setFormData, false)}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={enrolling}
                      className="w-full px-4 py-3 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      {enrolling ? 'Enrolling...' : `Enroll ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}`}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ==================== EDIT MODAL ==================== */}
      {isEditModalOpen && editFormData && createPortal(
        <div className="relative z-50" aria-modal="true">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8 my-8 animate-fade-in">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-2xl font-bold text-gray-900">Edit User</h3>
                <p className="text-sm text-gray-500 mt-1 mb-6">
                  Update the user's details below. Email and ID are read-only.
                </p>
                <form onSubmit={handleUpdate} className="space-y-6">
                  {renderFormFields(editFormData, setEditFormData, true)}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="w-full px-4 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      {updating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ==================== DELETE CONFIRMATION DIALOG ==================== */}
      {isDeleteDialogOpen && userToDelete && createPortal(
        <div className="relative z-50" aria-modal="true">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsDeleteDialogOpen(false)}></div>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-6 my-8 animate-fade-in">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Delete User</h3>
                  <p className="text-sm text-gray-500 mt-2 mb-1">
                    Are you sure you want to delete this user? This action cannot be undone.
                  </p>
                  <div className="bg-gray-50 rounded-xl px-4 py-3 w-full mt-3 mb-5">
                    <p className="text-sm font-medium text-gray-900">{userToDelete.name}</p>
                    <p className="text-xs text-gray-500">{userToDelete.email}</p>
                    {userToDelete.identificationNumber && (
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">ID: {userToDelete.identificationNumber}</p>
                    )}
                  </div>
                  <div className="flex gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => setIsDeleteDialogOpen(false)}
                      className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="w-full px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-sm disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
