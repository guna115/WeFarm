'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Geolocation } from '@capacitor/geolocation';
import { API_URL } from '@/lib/config';

export default function PushNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Only run on native Android/iOS if google-services.json is configured
    // Note: Calling PushNotifications without google-services.json in android/app throws IllegalStateException
    const isFirebaseConfigured = false; 
    if (Capacitor.isNativePlatform() && isFirebaseConfigured) {
      setupPushNotifications();
    }
  }, []);

  const setupPushNotifications = async () => {
    try {
      // 1. Request permission
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.warn('User denied push notification permissions');
        return;
      }

      // 2. Register for push notifications
      await PushNotifications.register();

      // 3. Add listeners
      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token:', token.value);
        await registerDeviceWithBackend(token.value);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('Push action performed: ', action);
      });
    } catch (error) {
      console.error('Failed to setup push notifications:', error);
    }
  };

  const registerDeviceWithBackend = async (fcmToken: string) => {
    try {
      // Generate a unique device ID if one doesn't exist
      let deviceId = localStorage.getItem('wefarm_device_id');
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('wefarm_device_id', deviceId);
      }

      // Try to get location to send to backend for targeted push
      let lat, lng;
      try {
        const position = await Geolocation.getCurrentPosition();
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } catch (locErr) {
        console.warn('Could not get location for device registration', locErr);
      }

      // Send to backend
      await fetch(`${API_URL}/devices/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          fcm_token: fcmToken,
          latitude: lat,
          longitude: lng,
        }),
      });
      console.log('Device registered with backend successfully');
    } catch (err) {
      console.error('Failed to register device with backend:', err);
    }
  };

  return <>{children}</>;
}
