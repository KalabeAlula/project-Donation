import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapWrapperProps {
  center: [number, number];
  zoom: number;
  markerPosition: [number, number];
  popupContent: string;
}

const MapWrapper: React.FC<MapWrapperProps> = ({ center, zoom, markerPosition, popupContent }) => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !map) {
      // Initialize the map
      const mapInstance = L.map(mapRef.current).setView(center, zoom);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);
      
      // Add marker with popup
      L.marker(markerPosition)
        .addTo(mapInstance)
        .bindPopup(popupContent)
        .openPopup();
      
      setMap(mapInstance);
      
      // Invalidate size to ensure map renders correctly after container is sized
      mapInstance.invalidateSize();
      
      // Cleanup function
      return () => {
        mapInstance.remove();
      };
    }
  }, [center, zoom, markerPosition, popupContent, map]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
};

export default MapWrapper;