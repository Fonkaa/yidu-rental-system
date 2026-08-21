import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPendingProperties,
  approveProperty,
  rejectProperty,
  getAllUsers,
  toggleUserActive,
  getCommissionRate,
  updateCommissionRate,
} from '../services/adminService';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const [tab, setTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [rate, setRate] = useState('');
  const [rateInput, setRateInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const loadPending = () => {
    getPendingProperties().then((res) => setPending(res.data)).catch(console.error);
  };

  const loadUsers = () => {
    getAllUsers().then((res) => setUsers(res.data)).catch(console.error);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPendingProperties().then((res) => setPending(res.data)),
      getAllUsers().then((res) => setUsers(res.data)),
      getCommissionRate().then((res) => {
        setRate(res.data.ratePercent);
        setRateInput(res.data.ratePercent);
      }),
    ]).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await approveProperty(id);
      loadPending();
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      await rejectProperty(id);
      loadPending();
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleUser = async (id) => {
    setProcessingId(id);
    try {
      await toggleUserActive(id);
      loadUsers();
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateRate = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await updateCommissionRate(parseFloat(rateInput));
      setRate(res.data.ratePercent);
      setMessage('Commission rate updated successfully.');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-purple-600">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm">Welcome, {user?.fullName}</p>
          </div>
          <button onClick={handleLogout} className="text-gray-600 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50">
            Log Out
          </button>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-300">
          {['pending', 'users', 'commission'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 font-medium ${tab === t ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}
            >
              {t === 'pending' ? 'Pending Listings' : t === 'users' ? 'Users' : 'Commission Rate'}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-600">Loading...</p>}

        {!loading && tab === 'pending' && (
          <div>
            {pending.length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
                No pending listings right now.
              </div>
            )}
            <div className="space-y-4">
              {pending.map((p) => (
                <div key={p.id} className="bg-white rounded-lg shadow p-4">
                  {p.images && p.images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto mb-3 pb-1">
                      {p.images.map((img) => (
                        <img
                          key={img.id}
                          src={`http://localhost:5000${img.url}`}
                          alt={p.titleEn || p.titleAm}
                          className="h-32 w-44 object-cover rounded flex-shrink-0 border border-gray-200"
                        />
                      ))}
                    </div>
                  )}
                  {(!p.images || p.images.length === 0) && (
                    <p className="text-xs text-red-500 mb-3">⚠ No images uploaded for this listing.</p>
                  )}

                  <p className="font-semibold text-gray-800">{p.titleEn || p.titleAm}</p>
                  {p.titleAm && p.titleEn && <p className="text-sm text-gray-500">{p.titleAm}</p>}

                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{p.descriptionEn}</p>
                  {p.descriptionAm && (
                    <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{p.descriptionAm}</p>
                  )}

                  <p className="text-sm text-gray-500 mt-2">
                    By {p.landlord?.fullName} ({p.landlord?.email}) · {p.category?.name} · {p.location?.city}, {p.location?.subCity} · {p.price} Birr/month
                  </p>
                  {p.landmarkDescription && (
                    <p className="text-sm text-gray-500">Landmark: {p.landmarkDescription}</p>
                  )}
                  {p.gpsLat && p.gpsLng && (
                    <p className="text-sm text-gray-500">GPS: {p.gpsLat}, {p.gpsLng}</p>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleApprove(p.id)}
                      disabled={processingId === p.id}
                      className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      {processingId === p.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button onClick={() => handleReject(p.id)}
                      disabled={processingId === p.id}
                      className="text-sm bg-red-50 text-red-700 px-3 py-1 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      {processingId === p.id ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && tab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100">
                    <td className="px-4 py-2">{u.fullName}</td>
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2">{u.role}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-1 rounded ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button onClick={() => handleToggleUser(u.id)}
                        disabled={processingId === u.id}
                        className="text-xs bg-gray-50 text-gray-700 px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                        {processingId === u.id ? 'Processing...' : (u.isActive ? 'Deactivate' : 'Activate')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === 'commission' && (
          <div className="bg-white rounded-lg shadow p-6 max-w-sm">
            <p className="text-gray-600 mb-4">Current rate: <span className="font-semibold text-gray-800">{rate}%</span></p>
            <form onSubmit={handleUpdateRate}>
              {message && <p className="text-sm text-purple-600 mb-3">{message}</p>}
              <label className="block text-sm text-gray-700 mb-1">New Commission Rate (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              />
              <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
                Update Rate
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;