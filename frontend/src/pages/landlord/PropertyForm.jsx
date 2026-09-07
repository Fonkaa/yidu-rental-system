import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProperty, uploadPropertyImages } from '../../services/propertyService';
import { getCategories, getLocations } from '../../services/lookupService';
<<<<<<< HEAD
import { getMe, updateIdNumber } from '../../services/authService';
import { Building2, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Upload, X, Video } from 'lucide-react';
=======
import { getMe } from '../../services/authService';
import { Building2, ArrowLeft, Loader2, AlertCircle, ShieldCheck, Image as ImageIcon, X, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, FileSpreadsheet, ShieldAlert, Cpu, Layers } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../services/api';
>>>>>>> 7f717b18418d24f4c597bdce3c03fa7ee00961f6

export default function CreateProperty() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [images, setImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fayda verification
  const [checkingId, setCheckingId] = useState(true);
  const [hasId, setHasId] = useState(false);
<<<<<<< HEAD

  const [idNumberInput, setIdNumberInput] = useState('');
  const [faydaFrontImage, setFaydaFrontImage] = useState(null);
  const [faydaBackImage, setFaydaBackImage] = useState(null);

  const [idError, setIdError] = useState('');
  const [savingId, setSavingId] = useState(false);

  // Property form
=======
  const [faydaIdInput, setFaydaIdInput] = useState('');
  const [frontImageFile, setFrontImageFile] = useState(null);
  const [backImageFile, setBackImageFile] = useState(null);
  const [idError, setIdError] = useState('');
  const [savingId, setSavingId] = useState(false);

  // 2-Step Side-by-Side Luxury Viewport Flow
  const [formStep, setFormStep] = useState(1);

>>>>>>> 7f717b18418d24f4c597bdce3c03fa7ee00961f6
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

  // ============================================================
  // LOAD INITIAL DATA
  // ============================================================

  useEffect(() => {
<<<<<<< HEAD
    loadData();
=======
    getCategories().then((res) => setCategories(res.data)).catch(() => {});
    getLocations().then((res) => setLocations(res.data)).catch(() => {});
    getMe()
      .then((res) => {
        const user = res.data.user || res.data;
        setHasId(!!(user.idNumber && user.faydaFrontImage && user.faydaBackImage));
      })
      .catch(() => setHasId(false))
      .finally(() => setCheckingId(false));
>>>>>>> 7f717b18418d24f4c597bdce3c03fa7ee00961f6
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, locationsRes, meRes] = await Promise.all([
        getCategories(),
        getLocations(),
        getMe(),
      ]);

      setCategories(categoriesRes.data || []);
      setLocations(locationsRes.data || []);

      const user = meRes.data?.user;

      setHasId(!!user?.idNumber);

      if (user?.idNumber) {
        setIdNumberInput(String(user.idNumber));
      }
    } catch (err) {
      console.error('Failed to load create property data:', err);

      try {
        const meRes = await getMe();

        const user = meRes.data?.user;

        setHasId(!!user?.idNumber);

        if (user?.idNumber) {
          setIdNumberInput(String(user.idNumber));
        }
      } catch {
        setHasId(false);
      }
    } finally {
      setCheckingId(false);
    }
  };

  // ============================================================
  // PROPERTY FORM CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // ============================================================
  // FAYDA ID NUMBER INPUT
  // ============================================================

  const handleIdNumberChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 16);
    setIdNumberInput(digitsOnly);

    if (idError) {
      setIdError('');
    }
  };

  // ============================================================
  // FAYDA ID IMAGES
  // ============================================================

  const validateFaydaImage = (file) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return 'Only JPG, PNG, and WEBP images are allowed.';
    }

    if (file.size > 5 * 1024 * 1024) {
      return 'Image must be less than 5MB.';
    }

    return null;
  };

  const handleFrontImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFaydaImage(file);
    if (validationError) {
      setIdError(validationError);
      e.target.value = '';
      return;
    }

    setIdError('');
    setFaydaFrontImage(file);
  };

  const handleBackImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

<<<<<<< HEAD
    const validationError = validateFaydaImage(file);
    if (validationError) {
      setIdError(validationError);
      e.target.value = '';
      return;
    }

    setIdError('');
    setFaydaBackImage(file);
=======
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
>>>>>>> 7f717b18418d24f4c597bdce3c03fa7ee00961f6
  };

  const handleSaveFaydaVerification = async (e) => {
    e.preventDefault();

    setIdError('');

<<<<<<< HEAD
    const idNumber = idNumberInput.trim();

    if (!idNumber) {
      setIdError('Please enter your Fayda ID number.');
      return;
    }

    if (!/^\d{16}$/.test(idNumber)) {
      setIdError('Fayda ID number must be exactly 16 digits.');
      return;
    }

    if (!(faydaFrontImage instanceof File)) {
      setIdError('Please upload the front image of your Fayda ID.');
      return;
    }

    if (!(faydaBackImage instanceof File)) {
      setIdError('Please upload the back image of your Fayda ID.');
=======
    const trimmedId = faydaIdInput.trim();
    if (!/^\d{16}$/.test(trimmedId)) {
      setIdError('Fayda ID number must be exactly 16 numeric digits.');
      return;
    }

    if (!frontImageFile || !backImageFile) {
      setIdError('Please upload both the front and back images of your Fayda ID card.');
>>>>>>> 7f717b18418d24f4c597bdce3c03fa7ee00961f6
      return;
    }

    setSavingId(true);

    try {
<<<<<<< HEAD
      const response = await updateIdNumber({
        idNumber,
        faydaFrontImage,
        faydaBackImage,
      });

      console.log('Fayda information saved:', response);

=======
      const formData = new FormData();
      formData.append('idNumber', trimmedId);
      formData.append('faydaFrontImage', frontImageFile);
      formData.append('faydaBackImage', backImageFile);

      await api.post('/auth/verify-fayda', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

>>>>>>> 7f717b18418d24f4c597bdce3c03fa7ee00961f6
      setHasId(true);
      setIdError('');
      setFaydaFrontImage(null);
      setFaydaBackImage(null);

    } catch (err) {
<<<<<<< HEAD
      console.error('Fayda upload error:', err);

      setIdError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Something went wrong while saving your Fayda information.'
      );
=======
      console.error("Fayda verification error:", err);
      setIdError(err.response?.data?.error || 'Something went wrong saving your Fayda verification details.');
>>>>>>> 7f717b18418d24f4c597bdce3c03fa7ee00961f6
    } finally {
      setSavingId(false);
    }
  };

<<<<<<< HEAD
  // ============================================================
  // PROPERTY PHOTOS
  // ============================================================

  const handlePropertyImagesChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    setError('');

    if (selectedFiles.length === 0) {
      setImages([]);
      return;
    }

    if (selectedFiles.length > 10) {
      setError('You can select a maximum of 10 property photos.');
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) =>
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    );

    if (invalidFile) {
      setError('Only JPG, PNG, and WEBP property images are allowed.');
      return;
    }

    const largeFile = selectedFiles.find(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (largeFile) {
      setError('Each property image must be less than 5MB.');
      return;
    }

    setImages(selectedFiles);
  };

  const removePropertyImage = (index) => {
    setImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ============================================================
  // PROPERTY TOUR VIDEO
  // ============================================================

  const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];

    setError('');

    if (!file) {
      setVideoFile(null);
      return;
    }

    if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
      setError('Only MP4, WebM, or MOV video files are allowed.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setError('The property tour video must be less than 100MB.');
      e.target.value = '';
      return;
    }

    setVideoFile(file);
  };

  const removeVideo = () => {
    setVideoFile(null);
  };

  // ============================================================
  // GPS EXCEL IMPORT
  // ============================================================

  const handleExcelGpsUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    try {
      const XLSX = await import('xlsx');

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (!rows.length) {
        setError('The Excel file appears to be empty.');
        e.target.value = '';
        return;
      }

      const firstRow = rows[0];
      const lat = firstRow.lat ?? firstRow.Lat ?? firstRow.LAT ?? firstRow.latitude;
      const lng = firstRow.lng ?? firstRow.Lng ?? firstRow.LNG ?? firstRow.longitude;

      if (lat === undefined || lat === '' || lng === undefined || lng === '') {
        setError('Could not find "lat" and "lng" columns in the Excel file.');
        e.target.value = '';
        return;
      }

      setForm((prev) => ({
        ...prev,
        gpsLat: String(lat),
        gpsLng: String(lng),
      }));
    } catch (err) {
      console.error('Excel GPS import error:', err);
      setError('Failed to read GPS coordinates from the Excel file. Make sure it is a valid .xlsx or .xls file.');
    } finally {
      e.target.value = '';
    }
  };

  // ============================================================
  // CREATE PROPERTY
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (!form.titleEn && !form.titleAm) {
      setError('Please provide a property title in English or Amharic.');
      return;
    }

    if (!form.descriptionEn && !form.descriptionAm) {
      setError('Please provide a property description in English or Amharic.');
      return;
    }

    if (!form.price) {
      setError('Please enter the monthly rental price.');
      return;
    }

    if (!form.rooms) {
      setError('Please enter the number of rooms.');
      return;
    }

    if (!form.categoryId) {
      setError('Please select a property category.');
      return;
    }

    if (!form.locationId) {
      setError('Please select a sub-city.');
      return;
    }

=======
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

>>>>>>> 7f717b18418d24f4c597bdce3c03fa7ee00961f6
    if (images.length === 0) {
      setError('At least one property photo is required.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await createProperty(form);
      const propertyId = response.data?.id;

      if (!propertyId) {
        throw new Error('Property was created but no property ID was returned.');
      }

      const formData = new FormData();
      images.forEach((img) => formData.append('images', img));
<<<<<<< HEAD

=======
      
>>>>>>> 7f717b18418d24f4c597bdce3c03fa7ee00961f6
      if (videoFile) {
        formData.append('video', videoFile);
      }

      await uploadPropertyImages(propertyId, formData);

      setSuccess(true);

      setTimeout(() => {
        navigate('/landlord/properties');
      }, 1500);

    } catch (err) {
      console.error('Property creation error:', err);

      if (err.response?.data?.code === 'ID_REQUIRED') {
        setHasId(false);
      }

      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Something went wrong creating the listing.'
      );

      setSubmitting(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (checkingId) {
    return (
<<<<<<< HEAD
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-yellow-500" size={36} />
          <p className="text-xs text-slate-500">Checking your identity information...</p>
        </div>
=======
      <div className="h-full w-full bg-white flex items-center justify-center text-slate-800">
        <Loader2 className="animate-spin text-amber-500" size={32} />
>>>>>>> 7f717b18418d24f4c597bdce3c03fa7ee00961f6
      </div>
    );
  }

  // ============================================================
  // FAYDA VERIFICATION SCREEN
  // ============================================================

  if (!hasId) {
    return (
<<<<<<< HEAD
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10 relative overflow-y-auto font-sans">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        <form
          onSubmit={handleSaveId}
          className="bg-white border-2 border-black p-6 sm:p-8 rounded-2xl shadow-sm w-full max-w-2xl relative z-10 text-slate-900"
        >
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 bg-yellow-500 rounded-xl flex items-center justify-center border-2 border-black">
                <Building2 size={23} className="text-[#022036]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#022036]">Verify Your Identity</h1>
                <p className="text-xs text-slate-500">Required before creating a property listing</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Please provide your 16-digit Fayda ID number and upload both the front and back images of your Fayda ID.
            </p>
          </div>

          {idError && (
            <div className="p-3 bg-rose-50 border-2 border-black text-rose-700 text-xs rounded-xl mb-5 flex items-start gap-2 font-semibold">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{idError}</span>
            </div>
          )}

          <div className="mb-5">
            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Fayda ID Number *</label>
            <input
              type="text"
              value={idNumberInput}
              onChange={handleIdNumberChange}
              inputMode="numeric"
              maxLength={16}
              pattern="[0-9]{16}"
              placeholder="Enter 16 digit Fayda ID"
              className="w-full bg-slate-50 border-2 border-black rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-yellow-500 font-mono"
              required
            />
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[10px] text-slate-400">Exactly 16 digits</p>
              <p className={`text-[10px] font-bold ${idNumberInput.length === 16 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {idNumberInput.length}/16
              </p>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Fayda ID Images *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-black rounded-2xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-extrabold text-[#022036]">Front Side *</label>
                  {faydaFrontImage && <CheckCircle2 size={16} className="text-emerald-600" />}
                </div>
                {faydaFrontImage ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <img src={URL.createObjectURL(faydaFrontImage)} alt="Fayda front preview" className="w-full h-36 object-cover rounded-xl border-2 border-black" />
                      <button type="button" onClick={() => setFaydaFrontImage(null)} className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-rose-600 shadow-sm border border-black">
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-[10px] text-emerald-600 font-semibold truncate">✓ {faydaFrontImage.name}</p>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-black hover:border-yellow-500 bg-white rounded-xl cursor-pointer transition-colors">
                    <Upload size={24} className="text-yellow-500 mb-1.5" />
                    <span className="text-[11px] font-bold text-slate-700">Upload Front</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">JPG, PNG or WEBP</span>
                    <span className="text-[9px] text-slate-400">Max 5MB</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFrontImageChange} className="hidden" />
                  </label>
                )}
              </div>

              <div className="border-2 border-black rounded-2xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-extrabold text-[#022036]">Back Side *</label>
                  {faydaBackImage && <CheckCircle2 size={16} className="text-emerald-600" />}
                </div>
                {faydaBackImage ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <img src={URL.createObjectURL(faydaBackImage)} alt="Fayda back preview" className="w-full h-36 object-cover rounded-xl border-2 border-black" />
                      <button type="button" onClick={() => setFaydaBackImage(null)} className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-rose-600 shadow-sm border border-black">
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-[10px] text-emerald-600 font-semibold truncate">✓ {faydaBackImage.name}</p>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-black hover:border-yellow-500 bg-white rounded-xl cursor-pointer transition-colors">
                    <Upload size={24} className="text-yellow-500 mb-1.5" />
                    <span className="text-[11px] font-bold text-slate-700">Upload Back</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">JPG, PNG or WEBP</span>
                    <span className="text-[9px] text-slate-400">Max 5MB</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleBackImageChange} className="hidden" />
                  </label>
                )}
              </div>
=======
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
>>>>>>> 7f717b18418d24f4c597bdce3c03fa7ee00961f6
            </div>
          </div>

          <button
            type="submit"
<<<<<<< HEAD
            disabled={savingId || idNumberInput.length !== 16 || !faydaFrontImage || !faydaBackImage}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-200 disabled:text-slate-400 text-[#022036] font-extrabold py-3 rounded-xl transition-all shadow-sm text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-black"
          >
            {savingId ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving Fayda Information...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} /> Save and Continue
              </>
            )}
=======
            disabled={savingId}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-extrabold py-3 rounded-2xl transition-all shadow-md text-[11px] uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            {savingId ? 'Verifying & Saving...' : 'Verify & Continue'}
>>>>>>> 7f717b18418d24f4c597bdce3c03fa7ee00961f6
          </button>
        </form>
      </div>
    );
  }

  // ============================================================
  // CREATE PROPERTY SCREEN
  // ============================================================

  return (
<<<<<<< HEAD
    <div className="min-h-screen w-screen overflow-y-auto bg-white text-slate-800 flex flex-col font-sans">
      <header className="sticky top-0 z-30 bg-[#022036] border-b-2 border-black px-6 sm:px-12 py-3.5 flex items-center justify-between text-white shadow-sm">
        <button
          type="button"
          onClick={() => navigate('/landlord/properties')}
          className="flex items-center gap-2 text-[11px] font-semibold text-slate-300 hover:text-yellow-400 transition-colors"
        >
          <ArrowLeft size={15} /> Back to My Properties
        </button>
        <h1 className="text-sm font-bold text-white">Create Listing</h1>
      </header>

      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-5 flex-1">
        <form onSubmit={handleSubmit} className="bg-white border-2 border-black p-5 sm:p-7 rounded-2xl shadow-sm space-y-4">
          <div>
            <span className="text-[9px] font-extrabold text-yellow-600 uppercase tracking-widest block mb-0.5">Teamwork Portal</span>
            <h1 className="text-xl font-black text-[#022036]">Create Property Listing</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Add your property information and photos.</p>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border-2 border-black text-rose-700 text-[11px] rounded-xl flex items-center gap-2 font-semibold">
              <AlertCircle size={15} /> <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-2.5 bg-emerald-50 border-2 border-black text-emerald-800 text-[11px] rounded-xl flex items-center gap-2 font-semibold">
              <CheckCircle2 size={15} /> <span>Listing created successfully! It is now pending admin review.</span>
            </div>
          )}

          <fieldset disabled={submitting || success} className="space-y-3.5 disabled:opacity-60">
            {/* TITLE - English & Amharic Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Title (English)</label>
                <input
                  name="titleEn"
                  value={form.titleEn}
                  onChange={handleChange}
                  placeholder="e.g. Modern 2 Bedroom Apartment"
                  className="w-full bg-slate-50 border-2 border-black rounded-xl px-3.5 py-2 text-slate-900 text-sm focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Title (Amharic)</label>
                <input
                  name="titleAm"
                  value={form.titleAm}
                  onChange={handleChange}
                  placeholder="የቤት ርዕስ"
                  className="w-full bg-slate-50 border-2 border-black rounded-xl px-3.5 py-2 text-slate-900 text-sm focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            {/* DESCRIPTION - English & Amharic Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Description (English)</label>
                <textarea
                  name="descriptionEn"
                  value={form.descriptionEn}
                  onChange={handleChange}
                  placeholder="Describe your property..."
                  rows={2}
                  className="w-full bg-slate-50 border-2 border-black rounded-xl px-3.5 py-2 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Description (Amharic)</label>
                <textarea
                  name="descriptionAm"
                  value={form.descriptionAm}
                  onChange={handleChange}
                  placeholder="የቤቱን መግለጫ ያስገቡ..."
                  rows={2}
                  className="w-full bg-slate-50 border-2 border-black rounded-xl px-3.5 py-2 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 resize-none"
                />
              </div>
            </div>

            {/* PRICE & ROOMS Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Price (Birr/month) *</label>
                <input
                  type="number"
                  min="0"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="15000"
                  className="w-full bg-slate-50 border-2 border-black rounded-xl px-3.5 py-2 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Number of Rooms *</label>
                <input
                  type="number"
                  min="1"
                  name="rooms"
                  value={form.rooms}
                  onChange={handleChange}
                  placeholder="2"
                  className="w-full bg-slate-50 border-2 border-black rounded-xl px-3.5 py-2 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 font-mono"
                  required
                />
              </div>
            </div>

            {/* CATEGORY & LOCATION Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Category *</label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-black rounded-xl px-3.5 py-2 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 cursor-pointer"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Sub-city *</label>
                <select
                  name="locationId"
                  value={form.locationId}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-black rounded-xl px-3.5 py-2 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 cursor-pointer"
                  required
                >
                  <option value="">Select a sub-city</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.city} - {location.subCity}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* FURNISHED & LANDMARK Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex items-center gap-2.5 py-1">
                <input
                  type="checkbox"
                  name="furnished"
                  checked={form.furnished}
                  onChange={handleChange}
                  className="w-4 h-4 accent-yellow-500 border-2 border-black"
                />
                <span className="text-sm text-slate-700 font-semibold">Furnished Property</span>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Landmark Description</label>
                <input
                  name="landmarkDescription"
                  value={form.landmarkDescription}
                  onChange={handleChange}
                  placeholder="e.g. Near Bole Medhanealem Church"
                  className="w-full bg-slate-50 border-2 border-black rounded-xl px-3.5 py-2 text-slate-900 text-sm focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            {/* GPS Excel Import + Lat + Lng */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
              <div>
                <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Import GPS from Excel</label>
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  onChange={handleExcelGpsUpload}
                  className="w-full text-[11px] text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-2 file:border-black file:text-[10px] file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 file:cursor-pointer cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">GPS Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="gpsLat"
                  value={form.gpsLat}
                  onChange={handleChange}
                  placeholder="9.0108"
                  className="w-full bg-slate-50 border-2 border-black rounded-xl px-3.5 py-2 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">GPS Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="gpsLng"
                  value={form.gpsLng}
                  onChange={handleChange}
                  placeholder="38.7613"
                  className="w-full bg-slate-50 border-2 border-black rounded-xl px-3.5 py-2 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>
            </div>

            {/* PHOTOS & VIDEO Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Property Photos *</label>
                <div className="border-2 border-dashed border-black hover:border-yellow-500 rounded-xl p-3 transition-colors bg-slate-50">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Upload size={22} className="text-yellow-500 mb-1" />
                    <p className="text-[11px] font-bold text-slate-700">Select Photos</p>
                    <p className="text-[9px] text-slate-400">JPG, PNG, WEBP • Max 5MB each</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handlePropertyImagesChange}
                      className="mt-2 w-full text-[11px] text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-2 file:border-black file:text-[10px] file:font-bold file:bg-yellow-500 file:text-[#022036] hover:file:bg-yellow-400 cursor-pointer"
                    />
                  </div>
                </div>
                {images.length > 0 && (
                  <div className="mt-2.5">
                    <p className="text-[10px] font-bold text-slate-700 mb-1.5">Selected: {images.length} photos</p>
                    <div className="grid grid-cols-3 gap-2">
                      {images.map((image, index) => (
                        <div key={`${image.name}-${index}`} className="relative group">
                          <img src={URL.createObjectURL(image)} alt={`Property ${index + 1}`} className="w-full h-16 object-cover rounded-lg border-2 border-black" />
                          <button type="button" onClick={() => removePropertyImage(index)} className="absolute top-1 right-1 w-5 h-5 bg-white/90 hover:bg-white text-rose-600 rounded-full flex items-center justify-center shadow-sm border border-black">
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tour Video (Optional)</label>
                {videoFile ? (
                  <div className="border-2 border-black rounded-xl p-3 bg-slate-50 space-y-2">
                    <div className="relative">
                      <video src={URL.createObjectURL(videoFile)} controls className="w-full max-h-36 rounded-lg border-2 border-black bg-black" />
                      <button type="button" onClick={removeVideo} className="absolute top-2 right-2 w-6 h-6 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-rose-600 shadow-sm border border-black">
                        <X size={13} />
                      </button>
                    </div>
                    <p className="text-[10px] text-emerald-600 font-semibold truncate">✓ {videoFile.name}</p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-black hover:border-yellow-500 rounded-xl p-3 transition-colors bg-slate-50 h-[120px] flex items-center justify-center">
                    <div className="flex flex-col items-center text-center">
                      <Video size={22} className="text-yellow-500 mb-1" />
                      <p className="text-[11px] font-bold text-slate-700">Select Video</p>
                      <p className="text-[9px] text-slate-400">MP4, WebM, MOV • Max 100MB</p>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={handleVideoChange}
                        className="mt-2 w-full text-[11px] text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-2 file:border-black file:text-[10px] file:font-bold file:bg-yellow-500 file:text-[#022036] hover:file:bg-yellow-400 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={submitting || success}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-[#022036] font-extrabold py-2.5 rounded-xl transition-all shadow-sm uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 border-2 border-black"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Submitting Listing...
              </>
            ) : success ? (
              <>
                <CheckCircle2 size={16} /> Successfully Submitted
              </>
            ) : (
              'Submit Listing'
            )}
          </button>
=======
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

>>>>>>> 7f717b18418d24f4c597bdce3c03fa7ee00961f6
        </form>
      </main>
    </div>
  );
}