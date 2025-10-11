'use client';

import { useEffect, useRef, useState } from 'react';
import { MarkerClusterer } from '@googlemaps/markerclusterer';

type LatLngLiteral = {
  lat: number;
  lng: number;
};

const DEFAULT_CENTER: LatLngLiteral = {
  lat: 47.4979,
  lng: 19.0402,
};

interface MapShift {
  startAt?: string;
  hoursAwarded?: number | null;
  capacity?: number | null;
  registeredCount?: number | null;
}

interface MapOpportunity {
  id: string;
  title: string;
  location: {
    address: string;
    lat?: number | null;
    lng?: number | null;
  };
  categoryLabel?: string;
  nextShift?: MapShift;
}

interface MapProps {
  opportunities: MapOpportunity[];
  center?: LatLngLiteral;
  zoom?: number;
  onMarkerClick?: (opportunityId: string) => void;
  userLocation?: LatLngLiteral | null;
}

let loadPromise: Promise<void> | null = null;

const loadGoogleMapsApi = (apiKey: string) => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('A Google Maps csak böngészőben tölthető be.'));
  }

  if (window.google?.maps?.importLibrary) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    const params = new URLSearchParams({
      key: apiKey,
      v: 'weekly',
      libraries: 'places',
    });

    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => {
      if (window.google?.maps?.importLibrary) {
        resolve();
      } else {
        loadPromise = null;
        script.remove();
        reject(new Error('A google.maps.importLibrary nem érhető el a betöltés után.'));
      }
    });
    script.addEventListener('error', () => {
      loadPromise = null;
      script.remove();
      reject(new Error('Nem sikerült betölteni a Google Maps JavaScript API-t.'));
    });

    const existingScriptWithNonce = document.querySelector<HTMLScriptElement>('script[nonce]');
    if (existingScriptWithNonce?.nonce) {
      script.nonce = existingScriptWithNonce.nonce;
    }

    document.head.appendChild(script);
  });

  return loadPromise;
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return character;
    }
  });

const formatShiftSummary = (shift: MapShift | undefined) => {
  if (!shift?.startAt) {
    return 'Időpont egyeztetés alatt';
  }

  const dateFormatter = new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeFormatter = new Intl.DateTimeFormat('hu-HU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const start = new Date(shift.startAt);
  const date = dateFormatter.format(start);
  const time = timeFormatter.format(start);
  const hours =
    typeof shift.hoursAwarded === 'number'
      ? `${Number.isInteger(shift.hoursAwarded) ? shift.hoursAwarded.toFixed(0) : shift.hoursAwarded.toFixed(1)} óra`
      : 'Időtartam egyeztetés alatt';

  return `${date} • ${time} • ${hours}`;
};

const formatCapacity = (shift: MapShift | undefined) => {
  if (!shift || typeof shift.capacity !== 'number') {
    return 'Kapacitás egyeztetés alatt';
  }

  const registered = typeof shift.registeredCount === 'number' ? shift.registeredCount : 0;
  return `${registered}/${shift.capacity} jelentkező`;
};

export default function Map({
  opportunities,
  center = DEFAULT_CENTER,
  zoom = 12,
  onMarkerClick,
  userLocation = null,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);
  const activeInfoRef = useRef<google.maps.InfoWindow | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const hasInteractedRef = useRef(false);
  const interactionListenersRef = useRef<google.maps.MapsEventListener[]>([]);
  const suppressNextZoomRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    if (!apiKey) {
      setError(
        'Google Maps API kulcs nem található. Add hozzá a NEXT_PUBLIC_GOOGLE_MAPS_API_KEY változót a .env.local fájlhoz.',
      );
      return;
    }

    let isMounted = true;

    const initialize = async () => {
      try {
        await loadGoogleMapsApi(apiKey);
        const { Map } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary;

        if (!isMounted || !containerRef.current || mapRef.current) {
          return;
        }

        const map = new Map(containerRef.current, {
          center,
          zoom,
          mapId: 'IKSZ_FINDER_STUDENT_MAP',
          disableDefaultUI: true,
          zoomControl: true,
        });

        mapRef.current = map;
        interactionListenersRef.current.forEach((listener) => listener.remove());
        interactionListenersRef.current = [
          map.addListener('dragstart', () => {
            hasInteractedRef.current = true;
          }),
          map.addListener('zoom_changed', () => {
            if (suppressNextZoomRef.current) {
              suppressNextZoomRef.current = false;
              return;
            }
            hasInteractedRef.current = true;
          }),
        ];
        setIsReady(true);
        setError(null);
      } catch (initializationError) {
        console.error('Error initializing Google Maps:', initializationError);
        setError('Nem sikerült betölteni a térképet. Kérjük próbáld meg később.');
      }
    };

    initialize();

    return () => {
      isMounted = false;
      markersRef.current.forEach((marker) => {
        google.maps.event.clearInstanceListeners(marker);
        if ('setMap' in marker) {
          marker.setMap(null);
        } else {
          marker.map = null;
        }
      });
      markersRef.current = [];
      infoWindowsRef.current.forEach((window) => window.close());
      infoWindowsRef.current = [];
      activeInfoRef.current = null;
      clustererRef.current?.clearMarkers();
      clustererRef.current = null;
      interactionListenersRef.current.forEach((listener) => listener.remove());
      interactionListenersRef.current = [];
      hasInteractedRef.current = false;
      suppressNextZoomRef.current = false;
      mapRef.current = null;
    };
  }, [apiKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!isReady || !map) {
      return;
    }

    const shouldFitBounds = !hasInteractedRef.current;

    clustererRef.current?.clearMarkers();
    markersRef.current.forEach((marker) => {
      google.maps.event.clearInstanceListeners(marker);
      if ('setMap' in marker) {
        marker.setMap(null);
      } else {
        marker.map = null;
      }
    });
    markersRef.current = [];
    infoWindowsRef.current.forEach((window) => window.close());
    infoWindowsRef.current = [];
    activeInfoRef.current = null;

    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;

    const clusterMarkers: google.maps.Marker[] = [];

    if (userLocation) {
      const userMarker = new google.maps.Marker({
        position: userLocation,
        map,
        title: 'Az Ön helyzete',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        zIndex: 1000,
      });

      markersRef.current.push(userMarker);
      bounds.extend(userLocation);
      hasPoints = true;
    }

    opportunities.forEach((opportunity) => {
      const lat = opportunity.location?.lat;
      const lng = opportunity.location?.lng;

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return;
      }

      const position = { lat, lng };

      const shift = opportunity.nextShift;
      const capacity = typeof shift?.capacity === 'number' ? shift.capacity : null;
      const registered = typeof shift?.registeredCount === 'number' ? shift.registeredCount : 0;
      const available = capacity !== null ? capacity - registered : null;

      const markerColor =
        available === null
          ? '#3b82f6'
          : available > 5
            ? '#10b981'
            : available > 0
              ? '#f59e0b'
              : '#ef4444';

      const marker = new google.maps.Marker({
        position,
        map,
        title: opportunity.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      const infoWindowContent = `
        <div style="max-width: 260px; font-family: 'Inter', sans-serif;">
          <h3 style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: #111827;">
            ${escapeHtml(opportunity.title)}
          </h3>
          <div style="margin-bottom: 4px; font-size: 13px; color: #4b5563;">
            ${escapeHtml(opportunity.location.address)}
          </div>
          <div style="margin-bottom: 4px; font-size: 13px; color: #4b5563;">
            ${escapeHtml(formatShiftSummary(shift))}
          </div>
          <div style="font-size: 12px; color: #6b7280;">
            ${escapeHtml(formatCapacity(shift))}
          </div>
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent,
      });

      const handleMouseOver = () => {
        if (activeInfoRef.current === infoWindow) {
          return;
        }
        infoWindow.open({
          anchor: marker,
          map,
        });
      };

      const handleMouseOut = () => {
        if (activeInfoRef.current === infoWindow) {
          return;
        }
        infoWindow.close();
      };

      const handleClick = () => {
        activeInfoRef.current?.close();
        infoWindow.open({
          anchor: marker,
          map,
        });
        activeInfoRef.current = infoWindow;
        onMarkerClick?.(opportunity.id);
      };

      marker.addListener('mouseover', handleMouseOver);
      marker.addListener('mouseout', handleMouseOut);
      marker.addListener('click', handleClick);

      markersRef.current.push(marker);
      infoWindowsRef.current.push(infoWindow);
      bounds.extend(position);
      hasPoints = true;
      clusterMarkers.push(marker);
    });

    if (clusterMarkers.length > 0) {
      clustererRef.current = new MarkerClusterer({ map, markers: clusterMarkers });
    }

    if (hasPoints && shouldFitBounds) {
      suppressNextZoomRef.current = true;
      map.fitBounds(bounds, 64);
    } else if (!hasPoints) {
      suppressNextZoomRef.current = true;
      map.setCenter(center);
      map.setZoom(zoom);
    }

    if (process.env.NODE_ENV !== 'production') {
      (window as unknown as Record<string, unknown>).__IKSZ_MAP_DEBUG = {
        markers: clusterMarkers.map((marker) => ({
          title: marker.getTitle(),
          position: marker.getPosition()?.toJSON(),
        })),
        userLocation,
      };
    }
  }, [center, isReady, onMarkerClick, opportunities, userLocation, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!isReady || !map || !userLocation || hasInteractedRef.current) {
      return;
    }

    suppressNextZoomRef.current = true;
    map.panTo(userLocation);
  }, [isReady, userLocation]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-100 px-4 text-center text-sm text-slate-600">
        {error}
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}
