'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Store,
  User,
  Phone,
  MessageSquare,
  MapPin,
  Truck,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

import { API_URL } from '@/lib/config';

export default function SellerEditProfilePage() {
  const router = useRouter();
  const { user, seller, refreshSellerProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [formData, setFormData] = useState({
    nursery_name: '',
    owner_name: '',
    phone_number: '',
    whatsapp_number: '',
    address: '',
    district: '',
    state: 'Andhra Pradesh',
    latitude: 0,
    longitude: 0,
    courier_available: false,
  });

  // Pre-fill from existing profile or auth user
  useEffect(() => {
    if (seller) {
      setFormData({
        nursery_name: seller.nursery_name || '',
        owner_name: seller.owner_name || '',
        phone_number: seller.phone_number?.replace('+91', '') || '',
        whatsapp_number: (seller.whatsapp_number || seller.phone_number || '')?.replace('+91', ''),
        address: seller.address || '',
        district: seller.district || '',
        state: seller.state || 'Andhra Pradesh',
        latitude: seller.latitude || 0,
        longitude: seller.longitude || 0,
        courier_available: seller.courier_available || false,
      });
      if (seller.latitude && seller.longitude) {
        setLocationCaptured(true);
      }
    } else if (user?.phoneNumber) {
      const phone = user.phoneNumber.replace('+91', '');
      setFormData((prev) => ({
        ...prev,
        phone_number: phone,
        whatsapp_number: phone,
      }));
    }
  }, [seller, user]);

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
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const phoneNumber = user?.phoneNumber || `+91${formData.phone_number}`;

      const response = await fetch(`${API_URL}/seller/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          nursery_name: formData.nursery_name,
          owner_name: formData.owner_name,
          whatsapp_number: formData.whatsapp_number ? `+91${formData.whatsapp_number}` : undefined,
          address: formData.address,
          district: formData.district,
          state: formData.state,
          latitude: formData.latitude || undefined,
          longitude: formData.longitude || undefined,
          courier_available: formData.courier_available,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = `Status: ${response.status}`;
        try {
          const errObj = JSON.parse(errText);
          if (errObj.message) errMsg = errObj.message;
        } catch (e) {}
        throw new Error(errMsg);
      }

      // Refresh auth context
      await refreshSellerProfile();

      // Navigate back to the view profile page
      router.push('/seller/profile');
    } catch (error: any) {
      console.error('Profile save error:', error);
      alert(`API URL: ${API_URL}\nError: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    formData.nursery_name &&
    formData.owner_name &&
    formData.phone_number.length >= 10 &&
    formData.address &&
    formData.district;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface-50">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-surface-100">
          <div className="flex items-center gap-3 px-4 py-4">
            <button
              onClick={() => router.push('/seller/profile')}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-100 hover:bg-surface-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-surface-700" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-surface-900">
                {seller?.profile_complete ? 'Edit Profile' : 'Setup Your Nursery'}
              </h1>
              <p className="text-xs text-surface-500">
                {seller?.profile_complete ? 'Update your nursery information' : 'Complete your profile to start selling'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 py-6 space-y-5">
          {/* Nursery Name */}
          <div>
            <label htmlFor="nursery_name" className="flex items-center gap-2 text-sm font-semibold text-surface-700 mb-2">
              <Store className="w-4 h-4 text-primary-600" /> Nursery Name *
            </label>
            <input id="nursery_name" name="nursery_name" type="text" value={formData.nursery_name} onChange={handleChange} placeholder="e.g. Green Valley Nursery" className="input-field" required />
          </div>

          {/* Owner Name */}
          <div>
            <label htmlFor="owner_name" className="flex items-center gap-2 text-sm font-semibold text-surface-700 mb-2">
              <User className="w-4 h-4 text-primary-600" /> Owner Name *
            </label>
            <input id="owner_name" name="owner_name" type="text" value={formData.owner_name} onChange={handleChange} placeholder="e.g. Ramesh Kumar" className="input-field" required />
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="phone_number" className="flex items-center gap-2 text-sm font-semibold text-surface-700 mb-2">
                <Phone className="w-4 h-4 text-primary-600" /> Phone *
              </label>
              <input id="phone_number" name="phone_number" type="tel" maxLength={10} value={formData.phone_number} className="input-field bg-surface-50" readOnly />
            </div>
            <div>
              <label htmlFor="whatsapp_number" className="flex items-center gap-2 text-sm font-semibold text-surface-700 mb-2">
                <MessageSquare className="w-4 h-4 text-green-600" /> WhatsApp
              </label>
              <input id="whatsapp_number" name="whatsapp_number" type="tel" maxLength={10} value={formData.whatsapp_number} onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp_number: e.target.value.replace(/\D/g, '') }))} placeholder="Same or different" className="input-field" />
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="flex items-center gap-2 text-sm font-semibold text-surface-700 mb-2">
              <MapPin className="w-4 h-4 text-primary-600" /> Full Address *
            </label>
            <textarea id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Enter your nursery address" rows={3} className="input-field resize-none" required />
          </div>

          {/* District & State */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="district" className="text-sm font-semibold text-surface-700 mb-2 block">District *</label>
              <input id="district" name="district" type="text" value={formData.district} onChange={handleChange} placeholder="e.g. Nellore" className="input-field" required />
            </div>
            <div>
              <label htmlFor="state" className="text-sm font-semibold text-surface-700 mb-2 block">State</label>
              <select id="state" name="state" value={formData.state} onChange={handleChange} className="input-field">
                <option>Andhra Pradesh</option>
                <option>Telangana</option>
                <option>Tamil Nadu</option>
                <option>Karnataka</option>
                <option>Kerala</option>
                <option>Maharashtra</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {/* GPS Location */}
          <div className="p-4 bg-white rounded-2xl border-2 border-surface-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-surface-800">GPS Location</p>
                  <p className="text-xs text-surface-500">
                    {locationCaptured ? `${Number(formData.latitude).toFixed(4)}, ${Number(formData.longitude).toFixed(4)}` : 'Capture your nursery location'}
                  </p>
                </div>
              </div>
              <button type="button" onClick={captureLocation} disabled={locationLoading} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${locationCaptured ? 'bg-primary-50 text-primary-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                {locationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : locationCaptured ? '✓ Captured' : 'Capture'}
              </button>
            </div>
          </div>

          {/* Courier Toggle */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-surface-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <Truck className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-surface-800">Courier Available?</p>
                <p className="text-xs text-surface-500">Can you ship plants to buyers?</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="courier_available" checked={formData.courier_available} onChange={handleChange} className="sr-only peer" />
              <div className="w-12 h-7 bg-surface-200 peer-focus:ring-4 peer-focus:ring-primary-300/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-500" />
            </label>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading || !isValid} className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base mt-4">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Save Profile
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
