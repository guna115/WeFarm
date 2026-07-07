import pool from '../config/db';
// import admin from 'firebase-admin';

// Initialize Firebase Admin (Uncomment and configure with service account to enable real pushes)
// admin.initializeApp({
//   credential: admin.credential.cert(require('../../firebase-service-account.json')),
// });

/**
 * Sends a push notification to devices near the seller's location
 */
export async function notifyNearbyDevices(sellerId: string, plantName: string, category: string, lat: number, lng: number) {
  try {
    const radiusKm = 20; // 20km radius
    
    // Find devices within radius using Haversine formula
    const nearbyDevicesQuery = `
      SELECT fcm_token, device_id,
      (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude)))) AS distance
      FROM devices
      WHERE fcm_token IS NOT NULL
      HAVING (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude)))) <= $3
    `;

    const devicesRes = await pool.query(nearbyDevicesQuery, [lat, lng, radiusKm]);
    const tokens = devicesRes.rows.map(row => row.fcm_token);

    if (tokens.length === 0) {
      console.log(`No nearby devices found within ${radiusKm}km to notify.`);
      return;
    }

    const message = {
      notification: {
        title: 'New Plants Nearby! 🌿',
        body: `A nursery just 20km away posted fresh ${category || plantName}. Tap to view!`,
      },
      data: {
        sellerId: sellerId,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      tokens: tokens, // Multicast message
    };

    console.log(`[Mock Push] Sending notification to ${tokens.length} devices...`, message);

    // Uncomment this to send real notifications
    // const response = await admin.messaging().sendMulticast(message);
    // console.log(response.successCount + ' messages were sent successfully');

  } catch (error) {
    console.error('Failed to notify nearby devices:', error);
  }
}
