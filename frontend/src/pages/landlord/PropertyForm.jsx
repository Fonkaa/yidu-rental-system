
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProperty, uploadPropertyImages } from '../../services/propertyService';
import { getCategories, getLocations } from '../../services/lookupService';
import { getMe, updateIdNumber } from '../../services/authService';
import { Building2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function CreateProperty() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fayda verification
  const [checkingId, setCheckingId] = useState(true);
  const [hasId, setHasId] = useState(false);

  const [idNumberInput, setIdNumberInput] = useState('');
  const [faydaFrontImage, setFaydaFrontImage] = useState(null);
  const [faydaBackImage, setFaydaBackImage] = useState(null);

  const [idError, setIdError] = useState('');
  const [savingId, setSavingId] = useState(false);

  // Property form
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
    loadData();
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

  const handleSaveId = async (e) => {
    e.preventDefault();

    setIdError('');

    const idNumber = idNumberInput.trim();

    // Validate ID number
    if (!idNumber) {
      setIdError('Please enter your Fayda ID number.');
      return;
    }

    if (!/^\d{16}$/.test(idNumber)) {
      setIdError('Fayda ID number must be exactly 16 digits.');
      return;
    }

    // Validate front image
    if (!(faydaFrontImage instanceof File)) {
      setIdError('Please upload the front image of your Fayda ID.');
      return;
    }

    // Validate back image
    if (!(faydaBackImage instanceof File)) {
      setIdError('Please upload the back image of your Fayda ID.');
      return;
    }

    setSavingId(true);

    try {
      /*
       * IMPORTANT:
       *
       * Send ALL Fayda information as ONE OBJECT.
       *
       * Do NOT do:
       *
       * updateIdNumber(idNumber)
       *
       * Correct:
       */

      const response = await updateIdNumber({
        idNumber,
        faydaFrontImage,
        faydaBackImage,
      });

      console.log('Fayda information saved:', response);

      setHasId(true);

      setIdError('');

      // Clear temporary browser files after successful upload
      setFaydaFrontImage(null);
      setFaydaBackImage(null);

    } catch (err) {
      console.error('Fayda upload error:', err);

      setIdError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Something went wrong while saving your Fayda information.'
      );
    } finally {
      setSavingId(false);
    }
  };

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
  // CREATE PROPERTY
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    // Title validation
    if (!form.titleEn && !form.titleAm) {
      setError(
        'Please provide a property title in English or Amharic.'
      );
      return;
    }

    // Description validation
    if (!form.descriptionEn && !form.descriptionAm) {
      setError(
        'Please provide a property description in English or Amharic.'
      );
      return;
    }

    // Price
    if (!form.price) {
      setError('Please enter the monthly rental price.');
      return;
    }

    // Rooms
    if (!form.rooms) {
      setError('Please enter the number of rooms.');
      return;
    }

    // Category
    if (!form.categoryId) {
      setError('Please select a property category.');
      return;
    }

    // Location
    if (!form.locationId) {
      setError('Please select a sub-city.');
      return;
    }

    // Property images
    if (images.length === 0) {
      setError('At least one property photo is required.');
      return;
    }

    setSubmitting(true);

    try {
      /*
       * STEP 1
       * Create property information
       *
       * Fayda information is NOT sent here.
       */
      const response = await createProperty(form);

      const propertyId = response.data?.id;

      if (!propertyId) {
        throw new Error(
          'Property was created but no property ID was returned.'
        );
      }

      /*
       * STEP 2
       * Upload ONLY property photos.
       *
       * Fayda front/back images are NOT added here.
       *
       * They were already uploaded through:
       *
       * updateIdNumber({
       *   idNumber,
       *   faydaFrontImage,
       *   faydaBackImage
       * })
       */
      const formData = new FormData();
      images.forEach((img) => formData.append('images', img));
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="animate-spin text-yellow-500"
            size={36}
          />

          <p className="text-xs text-slate-500">
            Checking your identity information...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // FAYDA VERIFICATION SCREEN
  // ============================================================

  if (!hasId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10 relative overflow-y-auto font-sans">

        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        <form
          onSubmit={handleSaveId}
          className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm w-full max-w-2xl relative z-10 text-slate-900"
        >

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 bg-yellow-500 rounded-xl flex items-center justify-center">
                <Building2
                  size={23}
                  className="text-[#022036]"
                />
              </div>

              <div>
                <h1 className="text-2xl font-black text-[#022036]">
                  Verify Your Identity
                </h1>

                <p className="text-xs text-slate-500">
                  Required before creating a property listing
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Please provide your 16-digit Fayda ID number and
              upload both the front and back images of your Fayda
              ID. Your information helps keep the rental platform
              safe and accountable.
            </p>
          </div>

          {/* Error */}
          {idError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl mb-6 flex items-start gap-2 font-semibold">
              <AlertCircle
                size={17}
                className="shrink-0 mt-0.5"
              />

              <span>{idError}</span>
            </div>
          )}

          {/* Fayda Number */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Fayda ID Number *
            </label>

            <input
              type="text"
              value={idNumberInput}
              onChange={handleIdNumberChange}
              inputMode="numeric"
              maxLength={16}
              pattern="[0-9]{16}"
              placeholder="Enter 16 digit Fayda ID"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-yellow-500 font-mono"
              required
            />

            <div className="flex items-center justify-between mt-2">
              <p className="text-[10px] text-slate-400">
                Exactly 16 digits
              </p>

              <p
                className={`text-[10px] font-bold ${
                  idNumberInput.length === 16
                    ? 'text-emerald-600'
                    : 'text-slate-400'
                }`}
              >
                {idNumberInput.length}/16
              </p>
            </div>
          </div>

          {/* Fayda Images */}
          <div className="mb-6">

            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Fayda ID Images *
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* FRONT */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">

                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-extrabold text-[#022036]">
                    Front Side *
                  </label>

                  {faydaFrontImage && (
                    <CheckCircle2
                      size={17}
                      className="text-emerald-600"
                    />
                  )}
                </div>

                {faydaFrontImage ? (
                  <div className="space-y-3">

                    <div className="relative">
                      <img
                        src={URL.createObjectURL(
                          faydaFrontImage
                        )}
                        alt="Fayda front preview"
                        className="w-full h-40 object-cover rounded-xl border border-slate-200"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setFaydaFrontImage(null)
                        }
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-rose-600 shadow-sm"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <p className="text-[10px] text-emerald-600 font-semibold truncate">
                      ✓ {faydaFrontImage.name}
                    </p>

                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-300 hover:border-yellow-500 bg-white rounded-xl cursor-pointer transition-colors">

                    <Upload
                      size={28}
                      className="text-yellow-500 mb-2"
                    />

                    <span className="text-xs font-bold text-slate-700">
                      Upload Front
                    </span>

                    <span className="text-[10px] text-slate-400 mt-1">
                      JPG, PNG or WEBP
                    </span>

                    <span className="text-[9px] text-slate-400 mt-1">
                      Maximum 5MB
                    </span>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFrontImageChange}
                      className="hidden"
                    />

                  </label>
                )}
              </div>

              {/* BACK */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">

                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-extrabold text-[#022036]">
                    Back Side *
                  </label>

                  {faydaBackImage && (
                    <CheckCircle2
                      size={17}
                      className="text-emerald-600"
                    />
                  )}
                </div>

                {faydaBackImage ? (
                  <div className="space-y-3">

                    <div className="relative">
                      <img
                        src={URL.createObjectURL(
                          faydaBackImage
                        )}
                        alt="Fayda back preview"
                        className="w-full h-40 object-cover rounded-xl border border-slate-200"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setFaydaBackImage(null)
                        }
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-rose-600 shadow-sm"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <p className="text-[10px] text-emerald-600 font-semibold truncate">
                      ✓ {faydaBackImage.name}
                    </p>

                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-300 hover:border-yellow-500 bg-white rounded-xl cursor-pointer transition-colors">

                    <Upload
                      size={28}
                      className="text-yellow-500 mb-2"
                    />

                    <span className="text-xs font-bold text-slate-700">
                      Upload Back
                    </span>

                    <span className="text-[10px] text-slate-400 mt-1">
                      JPG, PNG or WEBP
                    </span>

                    <span className="text-[9px] text-slate-400 mt-1">
                      Maximum 5MB
                    </span>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleBackImageChange}
                      className="hidden"
                    />

                  </label>
                )}
              </div>

            </div>
          </div>

          {/* Upload status */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  idNumberInput.length === 16
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {idNumberInput.length === 16 ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <span className="text-xs font-bold">1</span>
                )}
              </div>

              <div className="flex-1">
                <p className="text-xs font-bold text-slate-700">
                  Fayda number
                </p>

                <p className="text-[10px] text-slate-400">
                  {idNumberInput.length === 16
                    ? '16-digit number entered'
                    : 'Enter your 16-digit number'}
                </p>
              </div>

            </div>

            <div className="border-l border-slate-200 ml-4 pl-7 py-2">

              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    faydaFrontImage
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {faydaFrontImage ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <span className="text-xs font-bold">2</span>
                  )}
                </div>

                <p className="text-xs font-bold text-slate-700">
                  Front image
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    faydaBackImage
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {faydaBackImage ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <span className="text-xs font-bold">3</span>
                  )}
                </div>

                <p className="text-xs font-bold text-slate-700">
                  Back image
                </p>
              </div>

            </div>
          </div>

          {/* Save */}
          <button
            type="submit"
            disabled={
              savingId ||
              idNumberInput.length !== 16 ||
              !faydaFrontImage ||
              !faydaBackImage
            }
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-200 disabled:text-slate-400 text-[#022036] font-extrabold py-3.5 rounded-xl transition-all shadow-sm text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            {savingId ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Saving Fayda Information...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Save and Continue
              </>
            )}
          </button>

        </form>
      </div>
    );
  }

  // ============================================================
  // CREATE PROPERTY SCREEN
  // ============================================================

  return (
    <div className="min-h-screen w-screen overflow-y-auto bg-white text-slate-800 flex flex-col font-sans">

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-[#022036] border-b border-yellow-500/20 px-6 sm:px-12 py-4 flex items-center justify-between text-white shadow-sm">

        <button
          type="button"
          onClick={() =>
            navigate('/landlord/properties')
          }
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-yellow-400 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to My Properties
        </button>

        <h1 className="text-sm font-bold text-white">
          Create Listing
        </h1>

      </header>

      {/* MAIN */}
      <main className="max-w-3xl mx-auto w-full p-6 sm:p-12 space-y-8 flex-1">

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 p-6 sm:p-10 rounded-2xl shadow-sm space-y-6"
        >

          {/* TITLE */}
          <div>
            <span className="text-[10px] font-extrabold text-yellow-600 uppercase tracking-widest block mb-1">
              Teamwork Portal
            </span>

            <h1 className="text-2xl font-black text-[#022036]">
              Create Property Listing
            </h1>

            <p className="text-xs text-slate-400 mt-1">
              Add your property information and photos.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold">
              <CheckCircle2 size={17} />
              <span>
                Listing created successfully! It is now pending admin review.
              </span>
            </div>
          )}

          <fieldset
            disabled={submitting || success}
            className="space-y-5 disabled:opacity-60"
          >

            {/* TITLE EN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Title (English)
              </label>

              <input
                name="titleEn"
                value={form.titleEn}
                onChange={handleChange}
                placeholder="e.g. Modern 2 Bedroom Apartment"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* TITLE AM */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Title (Amharic)
              </label>

              <input
                name="titleAm"
                value={form.titleAm}
                onChange={handleChange}
                placeholder="የቤት ርዕስ"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500"
              />

              <p className="text-[10px] text-slate-400 mt-1">
                At least one language is required.
              </p>
            </div>

            {/* DESCRIPTION EN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description (English)
              </label>

              <textarea
                name="descriptionEn"
                value={form.descriptionEn}
                onChange={handleChange}
                placeholder="Describe your property..."
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 resize-none"
              />
            </div>

            {/* DESCRIPTION AM */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description (Amharic)
              </label>

              <textarea
                name="descriptionAm"
                value={form.descriptionAm}
                onChange={handleChange}
                placeholder="የቤቱን መግለጫ ያስገቡ..."
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 resize-none"
              />
            </div>

            {/* PRICE + ROOMS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Price (Birr/month) *
                </label>

                <input
                  type="number"
                  min="0"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="15000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Number of Rooms *
                </label>

                <input
                  type="number"
                  min="1"
                  name="rooms"
                  value={form.rooms}
                  onChange={handleChange}
                  placeholder="2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 font-mono"
                  required
                />
              </div>

            </div>

            {/* FURNISHED */}
            <label className="flex items-center gap-3 cursor-pointer py-1">

              <input
                type="checkbox"
                name="furnished"
                checked={form.furnished}
                onChange={handleChange}
                className="w-4 h-4 accent-yellow-500"
              />

              <span className="text-sm text-slate-700 font-semibold">
                Furnished Property
              </span>

            </label>

            {/* CATEGORY */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>

              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 cursor-pointer"
                required
              >
                <option value="">
                  Select a category
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* LOCATION */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sub-city *
              </label>

              <select
                name="locationId"
                value={form.locationId}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 cursor-pointer"
                required
              >
                <option value="">
                  Select a sub-city
                </option>

                {locations.map((location) => (
                  <option
                    key={location.id}
                    value={location.id}
                  >
                    {location.city} - {location.subCity}
                  </option>
                ))}
              </select>
            </div>

            {/* LANDMARK */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Landmark Description
              </label>

              <input
                name="landmarkDescription"
                value={form.landmarkDescription}
                onChange={handleChange}
                placeholder="e.g. Near Bole Medhanealem Church"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* GPS Excel Import Section */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Import GPS Coordinates from Excel (.xlsx/.xls)</label>
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                onChange={handleExcelGpsUpload}
                className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 file:cursor-pointer cursor-pointer" 
              />
              <p className="text-[10px] text-slate-400">Headers in your Excel sheet should be named <code className="text-slate-600 font-mono">lat</code> and <code className="text-slate-600 font-mono">lng</code>.</p>
            </div>

            {/* GPS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  GPS Latitude
                </label>

                <input
                  type="number"
                  step="any"
                  name="gpsLat"
                  value={form.gpsLat}
                  onChange={handleChange}
                  placeholder="9.0108"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  GPS Longitude
                </label>

                <input
                  type="number"
                  step="any"
                  name="gpsLng"
                  value={form.gpsLng}
                  onChange={handleChange}
                  placeholder="38.7613"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>

            </div>

            {/* PROPERTY PHOTOS */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Property Photos *
              </label>

              <div className="border-2 border-dashed border-slate-300 hover:border-yellow-500 rounded-2xl p-5 transition-colors">

                <div className="flex flex-col items-center justify-center text-center">

                  <Upload
                    size={30}
                    className="text-yellow-500 mb-2"
                  />

                  <p className="text-xs font-bold text-slate-700">
                    Select Property Photos
                  </p>

                  <p className="text-[10px] text-slate-400 mt-1">
                    JPG, PNG or WEBP — Maximum 5MB each
                  </p>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handlePropertyImagesChange}
                    className="mt-4 w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-yellow-500 file:text-[#022036] hover:file:bg-yellow-400 cursor-pointer"
                  />

                </div>
              </div>

              {/* SELECTED PROPERTY PHOTOS */}
              {images.length > 0 && (
                <div className="mt-4">

                  <p className="text-xs font-bold text-slate-700 mb-3">
                    Selected Photos: {images.length}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

                    {images.map((image, index) => (
                      <div
                        key={`${image.name}-${index}`}
                        className="relative group"
                      >

                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Property ${index + 1}`}
                          className="w-full h-28 object-cover rounded-xl border border-slate-200"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removePropertyImage(index)
                          }
                          className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white text-rose-600 rounded-full flex items-center justify-center shadow-sm"
                        >
                          <X size={14} />
                        </button>

                        <p className="text-[9px] text-slate-500 truncate mt-1">
                          {image.name}
                        </p>

                      </div>
                    ))}

                  </div>
                </div>
              )}

            </div>
          </fieldset>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={submitting || success}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-[#022036] font-extrabold py-3.5 rounded-xl transition-all shadow-sm uppercase tracking-wider text-xs flex items-center justify-center gap-2"
          >

            {submitting ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />

                Submitting Listing...
              </>
            ) : success ? (
              <>
                <CheckCircle2 size={17} />

                Successfully Submitted
              </>
            ) : (
              'Submit Listing'
            )}

          </button>

        </form>

      </main>
    </div>
  );
}

