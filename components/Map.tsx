'use client';

import { useEffect, useRef, useState } from 'react';

interface MapProps {
  opportunities: any[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (opportunityId: string) => void;
}

export default function Map({ 
  opportunities, 
  center = [47.4979, 19.0402], // Budapest center
  zoom = 12,
  onMarkerClick 
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  // Cleanup function
  const cleanup = () => {
    // Close and remove all info windows
    infoWindowsRef.current.forEach(infoWindow => {
      infoWindow.close();
    });
    infoWindowsRef.current = [];

    // Remove all markers
    markersRef.current.forEach(marker => {
      google.maps.event.clearInstanceListeners(marker);
      marker.setMap(null);
    });
    markersRef.current = [];
  };

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current || loadedRef.current) return;

      try {
        // Check if Google Maps is already loaded
        if (typeof google !== 'undefined' && google.maps) {
          initMap();
          return;
        }

        // Get API key from environment variables
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
          throw new Error('Google Maps API key not found. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.');
        }

        // Load Google Maps API
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          initMap();
        };
        
        script.onerror = () => {
          throw new Error('Failed to load Google Maps API');
        };

        document.head.appendChild(script);
        loadedRef.current = true;

      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError(err instanceof Error ? err.message : 'Térkép betöltése sikertelen. Kérjük próbálja újra később.');
      }
    };

    const initMap = () => {
      if (!mapRef.current) return;

      try {
        // Initialize map
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: center[0], lng: center[1] },
          zoom: zoom,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        mapInstanceRef.current = map;
        setIsLoaded(true);
        setError(null);

      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Térkép inicializálása sikertelen.');
      }
    };

    initializeMap();

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [center, zoom]);

  // Update markers when opportunities change
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    // Clean up existing markers
    cleanup();

    const map = mapInstanceRef.current;

    // Add user location marker
    const userMarker = new google.maps.Marker({
      position: { lat: center[0], lng: center[1] },
      map: map,
      title: 'Az Ön helyzete',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      }
    });

    const userInfoWindow = new google.maps.InfoWindow({
      content: '<div style="padding: 8px;"><strong>Az Ön helyzete</strong></div>'
    });

    const userClickListener = userMarker.addListener('click', () => {
      // Close other info windows
      infoWindowsRef.current.forEach(iw => iw.close());
      userInfoWindow.open(map, userMarker);
    });

    markersRef.current.push(userMarker);
    infoWindowsRef.current.push(userInfoWindow);

    // Add opportunity markers
    const opportunitiesToShow = opportunities.length > 0 ? opportunities : [
      {
        id: 'demo-1',
        title: 'Városliget - Környezetvédelem',
        location: { address: 'Városliget, Budapest', lat: 47.5186, lng: 19.0823 },
        date: '2024-02-15',
        duration: 4,
        capacity: 20,
        registered: 12
      },
      {
        id: 'demo-2',
        title: 'Margit körút - Idősek segítése',
        location: { address: 'Margit körút 45, Budapest', lat: 47.5125, lng: 19.0364 },
        date: '2024-02-18',
        duration: 3,
        capacity: 8,
        registered: 5
      },
      {
        id: 'demo-3',
        title: 'Üllői út - Állatvédelem',
        location: { address: 'Üllői út 200, Budapest', lat: 47.4563, lng: 19.1234 },
        date: '2024-02-20',
        duration: 5,
        capacity: 15,
        registered: 8
      },
      {
        id: 'demo-4',
        title: 'Váci út - Gyermekek',
        location: { address: 'Váci út 150, Budapest', lat: 47.5567, lng: 19.0678 },
        date: '2024-02-22',
        duration: 3,
        capacity: 6,
        registered: 4
      },
      {
        id: 'demo-5',
        title: 'Keleti pályaudvar - Szociális',
        location: { address: 'Keleti pályaudvar, Budapest', lat: 47.5000, lng: 19.0833 },
        date: '2024-02-25',
        duration: 4,
        capacity: 12,
        registered: 9
      }
    ];

    opportunitiesToShow.forEach((opportunity) => {
      if (opportunity.location?.lat && opportunity.location?.lng) {
        const availableSpots = opportunity.capacity - opportunity.registered;
        const markerColor = availableSpots > 5 ? '#10b981' : availableSpots > 0 ? '#f59e0b' : '#ef4444';
        
        const marker = new google.maps.Marker({
          position: { lat: opportunity.location.lat, lng: opportunity.location.lng },
          map: map,
          title: opportunity.title,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#3b82f6',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });

        const statusText = availableSpots > 0 ? `${availableSpots} hely maradt` : 'Betelt';
        
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
              <h3 style="font-weight: 600; font-size: 16px; margin: 0 0 8px 0; color: #1f2937;">${opportunity.title}</h3>
              <p style="font-size: 14px; color: #6b7280; margin: 0 0 6px 0; display: flex; align-items: center;">
                <span style="margin-right: 6px;">📍</span>
                ${opportunity.location.address}
              </p>
              <p style="font-size: 14px; color: #3b82f6; margin: 0 0 6px 0; display: flex; align-items: center;">
                <span style="margin-right: 6px;">📅</span>
                ${opportunity.date} • ${opportunity.duration}h
              </p>
              <p style="font-size: 14px; color: ${markerColor}; margin: 0; font-weight: 500; display: flex; align-items: center;">
                <span style="margin-right: 6px;">👥</span>
                ${statusText}
              </p>
            </div>
          `
        });

        const clickListener = marker.addListener('click', () => {
          // Close other info windows
          infoWindowsRef.current.forEach(iw => iw.close());
          
          infoWindow.open(map, marker);
          
          if (onMarkerClick) {
            onMarkerClick(opportunity.id);
          }
        });

        markersRef.current.push(marker);
        infoWindowsRef.current.push(infoWindow);
      }
    });

  }, [opportunities, isLoaded, center, onMarkerClick]);

  if (error) {
    return (
      <div className="w-full h-full rounded-lg border bg-gray-100 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600 text-sm">{error}</p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-left">
            <p className="text-xs text-blue-800 font-medium mb-2">Hogyan szerezz Google Maps API kulcsot:</p>
            <ol className="text-xs text-blue-700 space-y-1">
              <li>1. Menj a <a href="https://console.cloud.google.com" target="_blank" className="underline">Google Cloud Console</a>-ra</li>
              <li>2. Hozz létre egy új projektet vagy válassz egy meglévőt</li>
              <li>3. Engedélyezd a "Maps JavaScript API"-t</li>
              <li>4. Hozz létre egy API kulcsot</li>
              <li>5. Add hozzá a .env.local fájlhoz</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Always render the map container so the Google Maps API can initialize.
  return (
    <div
      className="w-full h-full rounded-lg relative"
      style={{ minHeight: '400px' }}
    >
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Google Maps betöltése...</p>
          </div>
        </div>
      )}
    </div>
  );
}