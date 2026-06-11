'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { type Post } from '@/components/buyer/PostCard';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix Leaflet's default icon path issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  posts: Post[];
  userLat?: number;
  userLng?: number;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function MapComponent({ posts, userLat, userLng }: MapComponentProps) {
  // Default to center of AP if no location
  const centerLat = userLat || 15.9129;
  const centerLng = userLng || 79.7400;

  return (
    <div className="h-[70vh] w-full rounded-2xl overflow-hidden shadow-sm border border-surface-200 relative z-0">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={userLat ? 9 : 7} // Zoom in closer if we have user location
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User Location Marker (Blue Dot) */}
        {userLat && userLng && (
          <Marker 
            position={[userLat, userLng]}
            icon={new L.DivIcon({
              className: 'custom-user-marker',
              html: `<div style="background-color: #2563eb; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Post Markers */}
        {posts.map((post) => {
          // Leaflet expects [lat, lng]
          const lat = parseFloat(post.latitude.toString());
          const lng = parseFloat(post.longitude.toString());
          
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker key={post.id} position={[lat, lng]}>
              <Popup>
                <div className="w-48">
                  <div className="w-full h-24 bg-surface-100 rounded-lg mb-2 overflow-hidden">
                    {post.image_urls?.[0] ? (
                      <img 
                        src={post.image_urls[0]}
                        alt={post.plant_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>
                    )}
                  </div>
                  <h3 className="font-bold text-surface-900 text-sm mb-1 line-clamp-1">{post.plant_name}</h3>
                  <p className="text-xs text-surface-500 mb-2">{post.distance_km} km away</p>
                  <a href={`tel:${post.whatsapp_number}`} className="block w-full text-center bg-primary-600 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-primary-700">
                    Call Seller
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        <MapUpdater center={[centerLat, centerLng]} />
      </MapContainer>
    </div>
  );
}
