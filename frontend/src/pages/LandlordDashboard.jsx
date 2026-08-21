import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyProperties, updatePropertyStatus, renewProperty } from '../services/propertyService';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  UNAVAILABLE: 'bg-gray-100 text-gray-800',
  RENTED: 'bg-blue-100 text-blue-800',
  EXPIRED: 'bg-orange-100 text-orange-800',
};

function LandlordDashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const loadProperties = () => {
    setLoading(true);
    getMyProperties()
      .then((res) => setProperties(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleMarkRented = async (id) => {
    setProcessingId(id);
    try {
      await updatePropertyStatus(id, 'RENTED');
      loadProperties();
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkUnavailable = async (id) => {
    setProcessingId(id);
    try {
      await updatePropertyStatus(id, 'UNAVAILABLE');
      loadProperties();
    } finally {
      setProcessingId(null);
    }
  };

  const handleRenew = async (id) => {
    setProcessingId(id);
    try {
      await renewProperty(id);
      loadProperties();
    } finally {
      setProcessingId(null);
    }
  };

  const grouped = {
    PENDING: properties.filter((p) => p.status === 'PENDING'),
    APPROVED: properties.filter((p) => p.status === 'APPROVED'),
    RENTED: properties.filter((p) => p.status === 'RENTED'),
    UNAVAILABLE: properties.filter((p) => p.status === 'UNAVAILABLE'),
    REJECTED: properties.filter((p) => p.status === 'REJECTED'),
    EXPIRED: properties.filter((p) => p.status === 'EXPIRED'),
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-purple-600">My Listings</h1>
            <p className="text-gray-600 text-sm">Welcome, {user?.fullName}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/properties/new" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              + New Listing
            </Link>
            <button onClick={handleLogout} className="text-gray-600 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50">
              Log Out
            </button>
          </div>
        </div>

        {loading && <p className="text-gray-600">Loading...</p>}

        {!loading && properties.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
            No listings yet. Create your first one!
          </div>
        )}

        {Object.entries(grouped).map(([status, items]) =>
          items.length > 0 ? (
            <div key={status} className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">{status} ({items.length})</h2>
              <div className="space-y-3">
                {items.map((p) => (
                  <div key={p.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{p.titleEn || p.titleAm}</p>
                      <p className="text-sm text-gray-500">
                        {p.category?.name} · {p.location?.city}, {p.location?.subCity} · {p.price} Birr/month
                      </p>
                      <span className={`inline-block mt-1 text-xs px-2 py-1 rounded ${statusColors[p.status]}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {p.status === 'APPROVED' && (
                        <>
                          <button onClick={() => handleMarkRented(p.id)}
                            disabled={processingId === p.id}
                            className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed">
                            {processingId === p.id ? 'Processing...' : 'Mark Rented'}
                          </button>
                          <button onClick={() => handleMarkUnavailable(p.id)}
                            disabled={processingId === p.id}
                            className="text-sm bg-gray-50 text-gray-700 px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                            {processingId === p.id ? 'Processing...' : 'Mark Unavailable'}
                          </button>
                        </>
                      )}
                      {p.status === 'EXPIRED' && (
                        <button onClick={() => handleRenew(p.id)}
                          disabled={processingId === p.id}
                          className="text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed">
                          {processingId === p.id ? 'Processing...' : 'Renew'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

export default LandlordDashboard;