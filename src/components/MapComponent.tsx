import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ExternalLink } from 'lucide-react';

interface MapComponentProps {
  gpsLat?: number | null;
  gpsLng?: number | null;
  gpsAccuracy?: number | null; // meters
  height?: string;
  zoom?: number;
  sessionName?: string;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  gpsLat,
  gpsLng,
  gpsAccuracy = 20,
  height = '320px',
  zoom = 14,
  sessionName,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const hasGps = typeof gpsLat === 'number' && typeof gpsLng === 'number' && (gpsLat !== 0 || gpsLng !== 0);
  const centerLat = hasGps ? gpsLat! : 30.3165;
  const centerLng = hasGps ? gpsLng! : 77.9934;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: hasGps ? zoom : 12,
        zoomControl: true,
        attributionControl: false,
      });

      // CartoDB Dark Matter tile layer for dark graphite look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([centerLat, centerLng], hasGps ? zoom : 12);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers/circles
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    if (hasGps) {
      // Clean single pin (Violet circle with subtle white border)
      const cleanIcon = L.divIcon({
        className: 'nimbus-map-pin',
        html: `
          <div style="
            width: 16px;
            height: 16px;
            background: #8B5CF6;
            border: 2.5px solid #F5F5F7;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          "></div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([gpsLat!, gpsLng!], { icon: cleanIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-size: 12px; color: #F5F5F7; font-family: ui-sans-serif, system-ui, sans-serif;">
          <div style="font-weight: 600; color: #8B5CF6; margin-bottom: 2px;">Authorized Location</div>
          <div>${gpsLat!.toFixed(5)}, ${gpsLng!.toFixed(5)}</div>
          <div style="color: #A1A1AA; font-size: 11px; margin-top: 2px;">Accuracy: ±${Math.round(gpsAccuracy || 20)}m</div>
        </div>
      `);

      // Clean accuracy circle with subtle violet fill
      L.circle([gpsLat!, gpsLng!], {
        radius: Math.max(gpsAccuracy || 20, 15),
        color: '#8B5CF6',
        fillColor: '#8B5CF6',
        fillOpacity: 0.12,
        weight: 1.5,
      }).addTo(map);
    }

    // Force map relayout
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [centerLat, centerLng, hasGps, gpsAccuracy, zoom]);

  const mapsUrl = hasGps ? `https://www.google.com/maps?q=${gpsLat},${gpsLng}` : null;

  return (
    <div className="space-y-3">
      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden border border-[#272A35] bg-[#0F1117]">
        <div
          ref={mapContainerRef}
          style={{ height }}
          className="w-full z-0"
        />

        {/* Coordinates Overlay */}
        {hasGps && (
          <div className="absolute top-3 right-3 z-[400] bg-[#151821]/90 backdrop-blur-xs border border-[#272A35] px-3 py-1.5 rounded-lg text-[11px] font-mono text-[#F5F5F7] shadow-sm">
            {gpsLat!.toFixed(4)}°, {gpsLng!.toFixed(4)}° (±{Math.round(gpsAccuracy || 20)}m)
          </div>
        )}
      </div>

      {/* Open in Google Maps */}
      {mapsUrl && (
        <div className="text-right">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#8B5CF6] hover:text-[#A78BFA] font-medium transition-colors"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
};

