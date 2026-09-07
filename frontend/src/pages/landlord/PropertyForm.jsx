import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProperty, uploadPropertyImages } from '../../services/propertyService';
import { getCategories, getLocations } from '../../services/lookupService';
import { getMe } from '../../services/authService';
import { Building2, ArrowLeft, Loader2, AlertCircle, ShieldCheck, Image as ImageIcon, X, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, FileSpreadsheet, ShieldAlert, Cpu, Layers } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../services/api';

export default function CreateProperty() {
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [images, setImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [checkingId, setCheckingId] = useState(true);
  const [hasId, setHasId] = useState(false);
  const [faydaIdInput, setFaydaIdInput] = useState('');
  const [frontImageFile, setFrontImageFile] = useState(null);
  const [backImageFile, setBackImageFile] = useState(null);
  const [idError, setIdError] = useState('');
  const [savingId, setSavingId] = useState(false);

  // 2-Step Side-by-Side Luxury Viewport Flow
  const [formStep, setFormStep] = useState(1);

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
      .then((res) => {
        const user = res.data.user || res.data;
        setHasId(!!(user.idNumber && user.faydaFrontImage && user.faydaBackImage));
      })
      .catch(() => setHasId(false))
      .finally(() => setCheckingId(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleExcelGpsUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          setError('The uploaded Excel file is empty.');
          return;
        }

        const row = jsonData[0];
        const lat = row.lat || row.Latitude || row.latitude || row.GPS_Lat || row.gpsLat || row['GPS Lat'];
        const lng = row.lng || row.Longitude || row.longitude || row.GPS_Lng || row.gpsLng || row['GPS Lng'];

        if (lat !== undefined && lng !== undefined) {
          setForm((prev) => ({
            ...prev,
            gpsLat: String(lat),
            gpsLng: String(lng),
          }));
        } else {
          setError('Could not find latitude/longitude columns. Ensure headers are named "lat" and "lng".');
        }
      } catch (err) {
        console.error('Excel parse error:', err);
        setError('Failed to parse the Excel file. Please upload a valid .xlsx or .xls file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSaveFaydaVerification = async (e) => {
    e.preventDefault();
    setIdError('');

    const trimmedId = faydaIdInput.trim();
    if (!/^\d{16}$/.test(trimmedId)) {
      setIdError('Fayda ID number must be exactly 16 numeric digits.');
      return;
    }

    if (!frontImageFile || !backImageFile) {
      setIdError('Please upload both the front and back images of your Fayda ID card.');
      return;
    }

    setSavingId(true);
    try {
      const formData = new FormData();
      formData.append('idNumber', trimmedId);
      formData.append('faydaFrontImage', frontImageFile);
      formData.append('faydaBackImage', backImageFile);

      await api.post('/auth/verify-fayda', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setHasId(true);
    } catch (err) {
      console.error("Fayda verification error:", err);
      setIdError(err.response?.data?.error || 'Something went wrong saving your Fayda verification details.');
    } finally {
      setSavingId(false);
    }
  };

  const handleNextStep = () => {
    setError('');
    if ((!form.titleEn && !form.titleAm) || !form.price || !form.rooms || !form.categoryId || !form.locationId) {
      setError('Please fill in all core fields (Title, Price, Rooms, Category, and Sub-city) before proceeding.');
      return;
    }
    setFormStep(2);
  };

  const handlePrevStep = () => {
    setError('');
    setFormStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (images.length === 0) {
      setError('At least one property photo is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createProperty(form);
      const propertyId = res.data.id;

      const formData = new FormData();
      images.forEach((img) => formData.append('images', img));
      
      if (videoFile) {
        formData.append('video', videoFile);
      }

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
      <div className="h-full w-full bg-white flex items-center justify-center text-slate-800">
        <Loader2 className="animate-spin text-amber-500" size={32} />
      </div>
    );
  }

  if (!hasId) {
    return (
      <div className="h-full w-full bg-slate-50 flex items-center justify-center px-4 overflow-hidden font-sans selection:bg-yellow-500 selection:text-[#022036]">
        <form onSubmit={handleSaveFaydaVerification} className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xl w-full max-w-xl relative z-10 text-slate-900 space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-xl font-black text-[#022036]">Fayda Digital ID Verification</h1>
            <p className="text-[11px] text-slate-500 font-light">Enter your exact 16-digit Fayda ID and upload verification cards.</p>
          </div>

          {idError && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] rounded-xl font-semibold flex items-center gap-2"><AlertCircle size={14} />{idError}</div>}

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider">16-Digit Fayda ID Number *</label>
            <input
              type="text"
              maxLength={16}
              value={faydaIdInput}
              onChange={(e) => setFaydaIdInput(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-yellow-500 font-mono tracking-widest font-bold shadow-inner"
              placeholder="e.g. 1234567890123456"
              required
            />
            <span className="text-[10px] text-slate-400 font-mono block text-right">{faydaIdInput.length}/16 digits</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 bg-slate-50/80 border border-slate-200 p-3 rounded-2xl">
              <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <ImageIcon size={14} className="text-amber-600" /> Front Image *
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFrontImageFile(e.target.files[0] || null)}
                className="w-full text-[10px] text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-[#FFC107] file:text-[#022036] hover:file:bg-yellow-400 cursor-pointer"
                required={!frontImageFile}
              />
              {frontImageFile && (
                <div className="relative h-20 rounded-xl overflow-hidden border border-slate-300 bg-black shadow-sm mt-2">
                  <img src={URL.createObjectURL(frontImageFile)} alt="Front Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setFrontImageFile(null)} className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"><X size={10} /></button>
                </div>
              )}
            </div>

            <div className="space-y-1.5 bg-slate-50/80 border border-slate-200 p-3 rounded-2xl">
              <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <ImageIcon size={14} className="text-amber-600" /> Back Image *
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setBackImageFile(e.target.files[0] || null)}
                className="w-full text-[10px] text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-[#FFC107] file:text-[#022036] hover:file:bg-yellow-400 cursor-pointer"
                required={!backImageFile}
              />
              {backImageFile && (
                <div className="relative h-20 rounded-xl overflow-hidden border border-slate-300 bg-black shadow-sm mt-2">
                  <img src={URL.createObjectURL(backImageFile)} alt="Back Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setBackImageFile(null)} className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"><X size={10} /></button>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={savingId}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-extrabold py-3 rounded-2xl transition-all shadow-md text-[11px] uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            {savingId ? 'Verifying & Saving...' : 'Verify & Continue'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-yellow-500 selection:text-[#022036] overflow-hidden">
      
      {/* Luxury Compact Header Bar */}
      <div className="px-6 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-yellow-500 text-[#022036] flex items-center justify-center font-black shadow-sm">
            <Sparkles size={16} />
          </div>
          <div>
            <h1 className="text-xs font-black text-[#022036] tracking-tight">Elite Property Suite</h1>
            <p className="text-[10px] text-slate-500 font-light">Side-by-Side Viewport Registration • Step {formStep} of 2</p>
          </div>
        </div>

        {/* Step Indicator Badges */}
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
          <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${formStep === 1 ? 'bg-yellow-500 text-[#022036]' : 'text-slate-400 bg-slate-200'}`}>1</span>
          <span className="text-slate-300 text-[10px]">—</span>
          <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${formStep === 2 ? 'bg-yellow-500 text-[#022036]' : 'text-slate-400 bg-slate-200'}`}>2</span>
        </div>
      </div>

      {/* Main Non-Scrollable Side-by-Side Viewport Canvas */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden justify-center max-w-7xl mx-auto w-full">

        <form onSubmit={handleSubmit} className="h-full max-h-[calc(100vh-115px)] flex flex-col justify-between">

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2.5 flex-shrink-0 mb-3 shadow-xs">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2.5 flex-shrink-0 mb-3 shadow-xs">
              <CheckCircle2 size={16} />
              <span>Listing published successfully! Pending review.</span>
            </div>
          )}

          {/* ================= SIDE-BY-SIDE 2-COLUMN VIEWPORT LAYOUT ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full overflow-hidden">
            
            {/* COLUMN 1: BASIC SPECS & DESCRIPTIONS */}
            <div className={`lg:col-span-6 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between overflow-hidden ${formStep === 1 ? 'flex' : 'hidden lg:flex opacity-60 pointer-events-none'}`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black text-xs shadow-inner">1</div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-[#022036]">Asset Information & Specs</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">Title (English) *</label>
                    <input name="titleEn" value={form.titleEn} onChange={handleChange} placeholder="e.g. Luxury Apartment in Bole"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-bold shadow-inner" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">Title (Amharic)</label>
                    <input name="titleAm" value={form.titleAm} onChange={handleChange} placeholder="ቦሌ የቅንጦት አፓርታማ"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-bold shadow-inner" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">Price / Mo (ETB) *</label>
                    <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="25000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-mono font-black shadow-inner" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">Rooms *</label>
                    <input type="number" name="rooms" value={form.rooms} onChange={handleChange} placeholder="3"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-mono font-black shadow-inner" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">Category *</label>
                    <select name="categoryId" value={form.categoryId} onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-bold cursor-pointer shadow-inner" required>
                      <option value="">Select</option>
                      {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">Sub-city *</label>
                    <select name="locationId" value={form.locationId} onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-bold cursor-pointer shadow-inner" required>
                      <option value="">Select sub-city</option>
                      {locations.map((l) => (<option key={l.id} value={l.id}>{l.city} - {l.subCity}</option>))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">Landmark</label>
                    <input name="landmarkDescription" value={form.landmarkDescription} onChange={handleChange} placeholder="Near Medhanealem"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-bold shadow-inner" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">Description (English)</label>
                    <textarea name="descriptionEn" value={form.descriptionEn} onChange={handleChange} placeholder="Summary..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-bold shadow-inner" rows="2" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">Description (Amharic)</label>
                    <textarea name="descriptionAm" value={form.descriptionAm} onChange={handleChange} placeholder="መግለጫ..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-bold shadow-inner" rows="2" />
                  </div>
                </div>

                {/* FILLED LOWER SECTION BANNER TO ELIMINATE WHITE SPACE */}
                <div className="p-4 bg-amber-50/70 border border-amber-200/70 rounded-2xl flex items-center gap-3.5 shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center flex-shrink-0">
                    <Cpu size={18} />
                  </div>
                  <div>
                    <strong className="text-xs text-[#022036] block font-extrabold">Listing Telemetry Active</strong>
                    <p className="text-[11px] text-slate-600 font-light">Multilingual attributes auto-synchronize with tenant discovery feeds instantly upon publishing.</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button type="button" onClick={handleNextStep}
                  className="px-7 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-black rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md">
                  <span>Next: GPS & Media</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* COLUMN 2: GPS, EXCEL & MEDIA UPLOADS */}
            <div className={`lg:col-span-6 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between overflow-hidden ${formStep === 2 ? 'flex' : 'hidden lg:flex opacity-60 pointer-events-none'}`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black text-xs shadow-inner">2</div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-[#022036]">GPS, Excel & High-Res Media</h2>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FileSpreadsheet size={15} className="text-emerald-600" /> Excel GPS Import (.xlsx/.xls)
                    </label>
                    <input type="file" accept=".xlsx, .xls" onChange={handleExcelGpsUpload} className="w-56 text-xs text-slate-600 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-slate-200 file:text-slate-700 file:font-bold cursor-pointer" />
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-1 text-xs">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wider">Latitude</label>
                      <input type="number" step="any" name="gpsLat" value={form.gpsLat} onChange={handleChange} placeholder="9.019"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-xs font-mono font-bold shadow-inner" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wider">Longitude</label>
                      <input type="number" step="any" name="gpsLng" value={form.gpsLng} onChange={handleChange} placeholder="38.752"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-xs font-mono font-bold shadow-inner" />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                        <input type="checkbox" name="furnished" checked={form.furnished} onChange={handleChange} className="w-4 h-4 accent-yellow-500 cursor-pointer rounded" />
                        <span className="text-xs text-slate-900 font-black">Furnished</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl shadow-inner">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Property Photos * (Max 5MB)</label>
                    <input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files))}
                      className="w-full text-xs text-slate-600 file:py-2.5 file:px-3.5 file:rounded-xl file:border-0 file:bg-yellow-500 file:text-[#022036] file:font-black cursor-pointer shadow-xs" />
                  </div>

                  <div className="space-y-1.5 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl shadow-inner">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Property Tour Video (Opt)</label>
                    <input type="file" accept="video/mp4,video/webm" onChange={(e) => setVideoFile(e.target.files[0] || null)}
                      className="w-full text-xs text-slate-600 file:py-2.5 file:px-3.5 file:rounded-xl file:border-0 file:bg-slate-200 file:text-slate-700 file:font-black cursor-pointer shadow-xs" />
                  </div>
                </div>

                {/* FILLED LOWER SECTION BANNER TO ELIMINATE WHITE SPACE */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3.5 shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <strong className="text-xs text-slate-900 block font-extrabold">Media Encryption & Verification</strong>
                    <p className="text-[11px] text-slate-500 font-light">All uploaded image and video assets are securely processed before publishing to tenant portals.</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button type="button" onClick={handlePrevStep}
                  className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs">
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>
                <button type="submit" disabled={submitting || success}
                  className="px-8 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-black rounded-2xl text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  <span>{submitting ? 'Publishing...' : success ? 'Published' : 'Publish Listing'}</span>
                </button>
              </div>
            </div>

          </div>

        </form>
      </main>
    </div>
  );
}