'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Camera,
  X,
  Plus,
  Loader2,
  CheckCircle2,
  Sprout,
  Calendar,
  MapPin,
  Truck,
  Image as ImageIcon,
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';

import { API_URL } from '@/lib/config';

export default function AddPostPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, seller } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [step, setStep] = useState<'camera' | 'details'>('camera');

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);

  const [formData, setFormData] = useState({
    plant_name: '',
    category: 'tomato',
    days_old: '',
    address: '',
    latitude: 0,
    longitude: 0,
    courier_available: false,
  });

  // Pre-fill from seller profile
  useEffect(() => {
    if (seller) {
      setFormData((prev) => ({
        ...prev,
        address: prev.address || seller.address || '',
        latitude: prev.latitude || seller.latitude || 0,
        longitude: prev.longitude || seller.longitude || 0,
        courier_available: seller.courier_available || false,
      }));
      if (seller.latitude && seller.longitude) {
        setLocationCaptured(true);
      }
    }
  }, [seller]);

  const startCamera = useCallback(async () => {
    try {
      setCameraError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      setStream(mediaStream);
      setCameraActive(true);
    } catch {
      setCameraError('Camera access denied. Please allow camera permission to upload live photos.');
    }
  }, []);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setLocationCaptured(true);
        setLocationLoading(false);
      },
      (err) => {
        console.error('Location error:', err);
        alert('Failed to get location. Please allow location access and try again.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 60000 }
    );
  };

  // Attach stream to video element when it becomes available in the DOM
  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(console.error);
      };
    }
  }, [cameraActive, stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImages((prev) => [...prev, dataUrl]);
  }, [seller]);

  const removeImage = (index: number) => {
    setCapturedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Convert data URL to Blob
  function dataUrlToBlob(dataUrl: string): Blob {
    const parts = dataUrl.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(parts[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new Blob([u8arr], { type: mime });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (capturedImages.length === 0 || !seller) return;
    setLoading(true);

    try {
      // Step 1: Upload images to Cloudinary
      setUploadProgress('Uploading images...');
      const formDataUpload = new FormData();
      formDataUpload.append('nursery_name', seller.nursery_name);
      for (let i = 0; i < capturedImages.length; i++) {
        const blob = dataUrlToBlob(capturedImages[i]);
        formDataUpload.append('images', blob, `photo_${i + 1}.jpg`);
      }

      const uploadRes = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formDataUpload,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.message || 'Image upload failed');
      }

      const uploadData = await uploadRes.json();

      // Step 2: Create post
      setUploadProgress('Creating post...');
      const postRes = await fetch(`${API_URL}/posts/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: seller.id,
          phone_number: user?.phoneNumber,
          plant_name: formData.plant_name,
          category: formData.category,
          days_old: parseInt(formData.days_old),
          image_urls: uploadData.urls,
          image_public_ids: uploadData.publicIds,
          contact_number: seller.phone_number,
          whatsapp_number: seller.whatsapp_number || seller.phone_number,
          address: formData.address,
          latitude: formData.latitude || seller.latitude,
          longitude: formData.longitude || seller.longitude,
          courier_available: formData.courier_available,
        }),
      });

      if (!postRes.ok) {
        const err = await postRes.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create post');
      }

      setUploadProgress('Post published! 🎉');
      setTimeout(() => router.push('/seller/dashboard'), 1000);
    } catch (error: any) {
      console.error('Post creation error:', error);
      alert(error.message || 'Failed to create post. Please try again.');
      setUploadProgress('');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const canProceed = capturedImages.length >= 1;
  const canSubmit = formData.plant_name && formData.days_old && formData.address;

  return (
    <ProtectedRoute requireProfile>
      <div className="min-h-screen bg-surface-50">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-surface-100">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <button onClick={() => { stopCamera(); router.back(); }} className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-100">
                <ArrowLeft className="w-5 h-5 text-surface-700" />
              </button>
              <h1 className="text-lg font-bold text-surface-900">
                {step === 'camera' ? t('addPost.capturePhotos') : t('addPost.plantDetails')}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-1.5 rounded-full ${step === 'camera' ? 'bg-primary-500' : 'bg-primary-200'}`} />
              <div className={`w-8 h-1.5 rounded-full ${step === 'details' ? 'bg-primary-500' : 'bg-surface-200'}`} />
            </div>
          </div>
        </div>

        {/* STEP 1: Camera */}
        {step === 'camera' && (
          <div className="px-4 py-6">
            {!cameraActive && !cameraError && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center mb-6">
                  <Camera className="w-12 h-12 text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-surface-800 mb-2">{t('addPost.livePhotosOnly')}</h3>
                <p className="text-sm text-surface-500 text-center max-w-xs mb-6">
                  {t('addPost.livePhotosDescription')}
                </p>
                <button onClick={startCamera} className="btn-primary text-base">
                  <Camera className="w-5 h-5 mr-2 inline" />{t('addPost.openCamera')}
                </button>
              </div>
            )}

            {cameraError && (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <Camera className="w-10 h-10 text-red-400" />
                </div>
                <p className="text-sm text-red-600 font-medium max-w-xs">{t('addPost.cameraError')}</p>
                <button onClick={startCamera} className="mt-4 btn-secondary text-sm">{t('common.refresh')}</button>
              </div>
            )}

            {cameraActive && (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-black">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-[4/3] object-cover" />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <button
                      onClick={capturePhoto}
                      disabled={capturedImages.length >= 5}
                      className="w-16 h-16 rounded-full bg-white border-4 border-primary-500 flex items-center justify-center shadow-xl active:scale-90 transition-transform disabled:opacity-50"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary-500" />
                    </button>
                  </div>
                  <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
                    <span className="text-xs font-bold text-white">{capturedImages.length}/5</span>
                  </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            {capturedImages.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-surface-700 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> {t('addPost.captured')} ({capturedImages.length})
                </h3>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {capturedImages.map((img, i) => (
                    <div key={i} className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 border-surface-200">
                      <img src={img} alt={`Captured ${i + 1}`} className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

              <button onClick={() => { stopCamera(); setStep('details'); }} className="w-full btn-primary mt-6 py-4 text-base">
                {t('addPost.nextAddDetails')} →
              </button>
            )}
          </div>
        )}

        {/* STEP 2: Details */}
        {step === 'details' && (
          <form onSubmit={handleSubmit} className="px-4 py-6 space-y-5">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {capturedImages.map((img, i) => (
                <div key={i} className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden">
                  <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              <button type="button" onClick={() => setStep('camera')} className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-surface-300 flex flex-col items-center justify-center gap-1">
                <Camera className="w-5 h-5 text-surface-400" />
                <span className="text-[10px] text-surface-500">Add</span>
              </button>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-surface-700 mb-2">
                <Sprout className="w-4 h-4 text-primary-600" /> {t('addPost.plantName')} *
              </label>
              <input name="plant_name" value={formData.plant_name} onChange={handleChange} placeholder="e.g. Tomato Seedlings" className="input-field" required />
            </div>

            <div>
              <label className="text-sm font-semibold text-surface-700 mb-2 block">{t('addPost.category')}</label>
              <select name="category" value={formData.category} onChange={handleChange} className="input-field">
                <option value="tomato">🍅 {t('categories.tomato')}</option>
                <option value="chilli">🌶️ {t('categories.chilli')}</option>
                <option value="brinjal">🍆 {t('categories.brinjal')}</option>
                <option value="cauliflower">🥦 {t('categories.cauliflower')}</option>
                <option value="cabbage">🥬 {t('categories.cabbage')}</option>
                <option value="onion">🧅 {t('categories.onion')}</option>
                <option value="capsicum">🫑 {t('categories.capsicum')}</option>
                <option value="gourd">🥒 {t('categories.gourd')}</option>
                <option value="leafy">🥗 {t('categories.leafy')}</option>
                <option value="flower">🌸 {t('categories.flower')}</option>
                <option value="fruit">🍈 {t('categories.fruit')}</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-surface-700 mb-2">
                <Calendar className="w-4 h-4 text-primary-600" /> {t('addPost.daysOld')} *
              </label>
              <input name="days_old" type="number" min="1" max="365" value={formData.days_old} onChange={handleChange} placeholder="e.g. 15" className="input-field" required />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-surface-700 mb-2">
                <MapPin className="w-4 h-4 text-primary-600" /> {t('addPost.pickupAddress')} *
              </label>
              <input name="address" value={formData.address} onChange={handleChange} placeholder="e.g. Kavali, Nellore District" className="input-field" required />
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-surface-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-surface-800">{t('addPost.liveLocation')}</p>
                    <p className="text-xs text-surface-500">
                      {locationCaptured ? `${Number(formData.latitude).toFixed(4)}, ${Number(formData.longitude).toFixed(4)}` : t('addPost.updateLocation')}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={captureLocation} disabled={locationLoading} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${locationCaptured ? 'bg-primary-50 text-primary-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                  {locationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : locationCaptured ? '✓ Update' : 'Capture'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-surface-200">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-bold text-surface-800">{t('addPost.courierAvailable')}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="courier_available" checked={formData.courier_available} onChange={handleChange} className="sr-only peer" />
                <div className="w-12 h-7 bg-surface-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-500" />
              </label>
            </div>

            {uploadProgress && (
              <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl">
                <Loader2 className="w-5 h-5 text-primary-600 animate-spin flex-shrink-0" />
                <span className="text-sm font-medium text-primary-700">{uploadProgress}</span>
              </div>
            )}

            <button type="submit" disabled={loading || !canSubmit} className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> {t('addPost.publishPost')}</>}
            </button>
          </form>
        )}
      </div>
    </ProtectedRoute>
  );
}
