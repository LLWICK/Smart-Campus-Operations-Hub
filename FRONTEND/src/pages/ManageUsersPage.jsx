import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { UserPlus, Search, Shield, Trash2, Mail, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New User Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const initialFormState = {
    firstName: '', lastName: '', email: '', role: 'student',
    phoneNumber: '', gender: 'Male', dob: '', 
    degreeProgram: 'Information Technology', salary: '', speciality: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const [enrolling, setEnrolling] = useState(false);

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

  const handleEnroll = async (e) => {
    e.preventDefault();
    setEnrolling(true);
    try {
      const res = await fetch('http://localhost:8080/api/admin/users/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 focus:border-primary-600 bg-gray-50/50"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            <Users className="w-4 h-4" />
            <span className="font-medium text-gray-900">{filteredUsers.length}</span> Active Users
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-12 flex justify-center text-gray-400">Loading directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100">
                          <Shield className="w-3 h-3" />
                          {user.role}
                        </div>
                      </td>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enrolment Modal Overlay */}
      {isModalOpen && createPortal(
        <div className="relative z-50" aria-modal="true">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

          {/* Scrolling Container */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8 my-8 animate-fade-in">
                <h3 className="text-2xl font-bold text-gray-900">Enroll New User</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Select user category and fill out their details.
            </p>

            <form onSubmit={handleEnroll} className="space-y-6">
              
              {/* Role Selection Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-50 p-1 rounded-xl">
                {['student', 'lecturer', 'admin', 'technician'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: r })}
                    className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all duration-200 ${
                      formData.role === r 
                        ? 'bg-white text-primary-700 shadow-sm ring-1 ring-gray-200' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Common Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text" required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 block"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text" required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 block"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Google Email Address</label>
                  <input
                    type="email" required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 block"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber || ''}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 block"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob || ''}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 block"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 block"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Dynamic Specific Details */}
              <div className="space-y-4">
                {formData.role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Degree Program</label>
                    <select
                      value={formData.degreeProgram}
                      onChange={(e) => setFormData({ ...formData, degreeProgram: e.target.value })}
                      className="w-full px-4 py-2.5 bg-primary-50/50 border border-primary-200 text-primary-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 block"
                    >
                      <option value="Information Technology">Information Technology</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Business">Business</option>
                      <option value="Science">Science</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}

                {(formData.role === 'lecturer' || formData.role === 'admin' || formData.role === 'technician') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary (Annual)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.salary || ''}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        className="w-full pl-8 pr-4 py-2.5 bg-primary-50/50 border border-primary-200 text-primary-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 block"
                        placeholder="e.g. 80000"
                      />
                    </div>
                  </div>
                )}

                {formData.role === 'technician' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <select
                        value={formData.speciality || 'Electrical'}
                        onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                        className="w-full px-4 py-2.5 bg-primary-50/50 border border-primary-200 text-primary-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 block"
                      >
                        <option value="Electrical">Electrical Engineer</option>
                        <option value="Network">Network Engineer</option>
                        <option value="Hardware">Hardware Technician</option>
                        <option value="Software">System Administrator</option>
                        <option value="Other">Other Maintenance</option>
                      </select>
                  </div>
                )}
              </div>

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
    </div>
  );
}
