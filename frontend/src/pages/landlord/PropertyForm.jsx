import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProperty, uploadPropertyImages } from '../../services/propertyService';
import { getCategories, getLocations } from '../../services/lookupService';
import { getMe, updateIdNumber } from '../../services/authService';
import { Building2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function CreateProperty() {
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
    getCategories().then((res) => setCategories(res.data)).catch(() => {});
    getLocations().then((res) => setLocations(res.data)).catch(() => {});
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
      setError('Please fill in all required fields (Titles, Descriptions, Price, Rooms, Category, and Sub-city).');
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
      setTimeout(() => navigate('/landlord/properties'), 1500);
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
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-800">
        <Loader2 className="animate-spin text-yellow-500" size={32} />
      </div>
    );
  }

  if (!hasId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 relative overflow-hidden font-sans selection:bg-yellow-500 selection:text-[#022036]">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <form onSubmit={handleSaveId} className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xs w-full max-w-md relative z-10 text-slate-900">
          <h1 className="text-2xl font-black text-[#022036] mb-2">Verify Your Identity</h1>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed font-light">
            Before creating a listing, please provide your national ID number. This keeps the platform accountable and safe for tenants.
          </p>

          {idError && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl mb-4 font-semibold">{idError}</div>}

          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">National ID Number *</label>
          <input
            value={idNumberInput}
            onChange={(e) => setIdNumberInput(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-yellow-500 font-mono mb-6"
            placeholder="Enter ID number"
            required
          />

          <button
            type="submit"
            disabled={savingId}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-extrabold py-3 rounded-xl transition-all shadow-sm text-xs uppercase tracking-wider cursor-pointer"
          >
            {savingId ? 'Saving...' : 'Save and Continue'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen overflow-y-auto bg-white text-slate-800 flex flex-col font-sans selection:bg-yellow-500 selection:text-[#022036]">
      
      {/* Top Header Bar (#022036) */}
      <header className="sticky top-0 z-30 bg-[#022036] border-b border-yellow-500/20 px-6 sm:px-12 py-4 flex items-center justify-between text-white shadow-xs">
        <button 
          onClick={() => navigate('/landlord/properties')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-yellow-400 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to My Properties
        </button>
        <h1 className="text-sm font-bold text-white tracking-tight">Create Listing</h1>
      </header>

      {/* Main Content Canvas (75% Clean White) */}
      <main className="max-w-3xl mx-auto w-full p-6 sm:p-12 space-y-8 flex-1 bg-white">
        
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-6 sm:p-10 rounded-2xl shadow-xs space-y-6">
          <div>
            <span className="text-[10px] font-extrabold text-yellow-600 uppercase tracking-widest block mb-1">Teamwork Portal</span>
            <h1 className="text-2xl font-black text-[#022036]">Create Property Listing</h1>
          </div>

          {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-semibold"><AlertCircle size={16}/>{error}</div>}
          {success && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-semibold">Listing created successfully! It is now pending admin review.</div>}

          <fieldset disabled={submitting || success} className="space-y-4 disabled:opacity-60">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Title (English)</label>
              <input name="titleEn" value={form.titleEn} onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 font-medium" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Title (Amharic)</label>
              <input name="titleAm" value={form.titleAm} onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 font-medium" />
              <p className="text-[10px] text-slate-400 mt-1">At least one language is required for title and description.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description (English)</label>
              <textarea name="descriptionEn" value={form.descriptionEn} onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500" rows="3" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description (Amharic)</label>
              <textarea name="descriptionAm" value={form.descriptionAm} onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500" rows="3" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Price (Birr/month) *</label>
                <input type="number" name="price" value={form.price} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 font-mono" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Number of Rooms *</label>
                <input type="number" name="rooms" value={form.rooms} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 font-mono" required />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer py-1">
              <input type="checkbox" name="furnished" checked={form.furnished} onChange={handleChange} className="w-4 h-4 accent-yellow-500 cursor-pointer" />
              <span className="text-sm text-slate-700 font-semibold">Furnished Property</span>
            </label>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category *</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 font-medium cursor-pointer" required>
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Sub-city *</label>
              <select name="locationId" value={form.locationId} onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 font-medium cursor-pointer" required>
                <option value="">Select a sub-city</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.city} - {l.subCity}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Landmark Description (Optional)</label>
              <input name="landmarkDescription" value={form.landmarkDescription} onChange={handleChange}
                placeholder="e.g. Near Bole Medhanealem Church"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-yellow-500 font-medium" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">GPS Latitude (Optional)</label>
                <input type="number" step="any" name="gpsLat" value={form.gpsLat} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">GPS Longitude (Optional)</label>
                <input type="number" step="any" name="gpsLng" value={form.gpsLng} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 font-mono" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Photos * (at least 1, max 5MB each)</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple
                onChange={(e) => setImages(Array.from(e.target.files))}
                className="w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-yellow-500 file:text-[#022036] hover:file:bg-yellow-400 file:cursor-pointer cursor-pointer" />
            </div>
          </fieldset>

          <button type="submit" disabled={submitting || success}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-extrabold py-3.5 rounded-xl transition-all shadow-sm uppercase tracking-wider text-xs disabled:opacity-50 cursor-pointer">
            {submitting ? 'Submitting Listing...' : success ? 'Successfully Submitted' : 'Submit Listing'}
          </button>
        </form>
      </main>
    </div>
  );
}