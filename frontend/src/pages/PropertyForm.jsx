import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProperty, uploadPropertyImages } from '../services/propertyService';
import { getCategories, getLocations } from '../services/lookupService';
import { getMe, updateIdNumber } from '../services/authService';

function PropertyForm() {
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [checkingId, setCheckingId] = useState(true);
  const [hasId, setHasId] = useState(false);
  const [idNumberInput, setIdNumberInput] = useState('');
  const [idError, setIdError] = useState('');
  const [savingId, setSavingId] = useState(false);

  const [form, setForm] = useState({
    titleEn: '',
    titleAm: '',
    descriptionEn: '',
    descriptionAm: '',
    price: '',
    rooms: '',
    furnished: false,
    categoryId: '',
    locationId: '',
    landmarkDescription: '',
    gpsLat: '',
    gpsLng: '',
  });

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data));
    getLocations().then((res) => setLocations(res.data));
    getMe()
      .then((res) => setHasId(!!res.data.user.idNumber))
      .catch(() => setHasId(false))
      .finally(() => setCheckingId(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveId = async (e) => {
    e.preventDefault();
    setIdError('');
    if (!idNumberInput.trim()) {
      setIdError('Please enter your ID number.');
      return;
    }
    setSavingId(true);
    try {
      await updateIdNumber(idNumberInput.trim());
      setHasId(true);
    } catch (err) {
      setIdError(err.response?.data?.error || 'Something went wrong saving your ID number');
    } finally {
      setSavingId(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if ((!form.titleEn && !form.titleAm) || (!form.descriptionEn && !form.descriptionAm) || !form.price || !form.rooms || !form.categoryId || !form.locationId) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!form.landmarkDescription && (!form.gpsLat || !form.gpsLng)) {
      setError('Please provide either a landmark description or GPS coordinates.');
      return;
    }
    if (images.length === 0) {
      setError('At least one photo is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createProperty(form);
      const propertyId = res.data.id;

      const formData = new FormData();
      images.forEach((img) => formData.append('images', img));
      await uploadPropertyImages(propertyId, formData);

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      if (err.response?.data?.code === 'ID_REQUIRED') {
        setHasId(false);
      }
      setError(err.response?.data?.error || 'Something went wrong creating the listing');
      setSubmitting(false);
    }
  };

  if (checkingId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!hasId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <form onSubmit={handleSaveId} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
          <h1 className="text-xl font-bold text-purple-600 mb-2">Verify Your Identity</h1>
          <p className="text-sm text-gray-600 mb-4">
            Before creating a listing, please provide your national ID number. This helps us keep the platform accountable and safe for tenants.
          </p>

          {idError && <p className="text-red-600 text-sm mb-4">{idError}</p>}

          <label className="block text-sm text-gray-700 mb-1">National ID Number *</label>
          <input
            value={idNumberInput}
            onChange={(e) => setIdNumberInput(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            required
          />

          <button
            type="submit"
            disabled={savingId}
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingId ? 'Saving...' : 'Save and Continue'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-purple-600 mb-6">Create Property Listing</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4">Listing created! It's pending admin review.</p>}

        <fieldset disabled={submitting || success} className="disabled:opacity-60">
          <label className="block text-sm text-gray-700 mb-1">Title (English)</label>
          <input name="titleEn" value={form.titleEn} onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4" />

          <label className="block text-sm text-gray-700 mb-1">Title (Amharic)</label>
          <input name="titleAm" value={form.titleAm} onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-1" />
          <p className="text-xs text-gray-500 mb-4">At least one language is required for title and description.</p>

          <label className="block text-sm text-gray-700 mb-1">Description (English)</label>
          <textarea name="descriptionEn" value={form.descriptionEn} onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4" rows="3" />

          <label className="block text-sm text-gray-700 mb-1">Description (Amharic)</label>
          <textarea name="descriptionAm" value={form.descriptionAm} onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4" rows="3" />

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Price (Birr/month) *</label>
              <input type="number" name="price" value={form.price} onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Number of Rooms *</label>
              <input type="number" name="rooms" value={form.rooms} onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2" required />
            </div>
          </div>

          <label className="flex items-center gap-2 mb-4">
            <input type="checkbox" name="furnished" checked={form.furnished} onChange={handleChange} />
            <span className="text-sm text-gray-700">Furnished</span>
          </label>

          <label className="block text-sm text-gray-700 mb-1">Category *</label>
          <select name="categoryId" value={form.categoryId} onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4" required>
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <label className="block text-sm text-gray-700 mb-1">Sub-city *</label>
          <select name="locationId" value={form.locationId} onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4" required>
            <option value="">Select a sub-city</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.city} - {l.subCity}</option>
            ))}
          </select>

          <label className="block text-sm text-gray-700 mb-1">Landmark Description</label>
          <input name="landmarkDescription" value={form.landmarkDescription} onChange={handleChange}
            placeholder="e.g. Near Bole Medhanealem Church"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4" />

          <p className="text-xs text-gray-500 mb-4">
            Provide either a landmark description above, or GPS coordinates below.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">GPS Latitude</label>
              <input type="number" step="any" name="gpsLat" value={form.gpsLat} onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">GPS Longitude</label>
              <input type="number" step="any" name="gpsLng" value={form.gpsLng} onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
          </div>

          <label className="block text-sm text-gray-700 mb-1">Photos * (at least 1, JPEG/PNG/WEBP, max 5MB each)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple
            onChange={(e) => setImages(Array.from(e.target.files))}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-6" />
        </fieldset>

        <button type="submit" disabled={submitting || success}
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? 'Submitting...' : success ? 'Submitted' : 'Submit Listing'}
        </button>
      </form>
    </div>
  );
}

export default PropertyForm;