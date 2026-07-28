import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

export interface LocationData {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
}

// Fix Leaflet default marker icon globally (runs once)
const DefaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function LocationPicker({
  onSelect,
  initialPosition = [28.6139, 77.209], // Delhi
}: {
  onSelect?: (loc: LocationData) => void;
  initialPosition?: [number, number];
}) {
  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: initialPosition[0],
    lng: initialPosition[1],
  });
  const [address, setAddress] = useState<LocationData | null>(null);
  const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_TOKEN;

  const fetchAddress = async (
    lat: number,
    lng: number
  ): Promise<LocationData> => {
    try {
      const res = await fetch(
        `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_KEY}&lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      return {
        lat,
        lng,
        address: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        city:
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          "",
        state: data.address?.state || "",
        country: data.address?.country || "",
      };
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      return {
        lat,
        lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      };
    }
  };

  const MarkerHandler = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setPosition({ lat, lng });
        const addr = await fetchAddress(lat, lng);
        setAddress(addr);
        onSelect?.(addr);
      },
    });

    return (
      <Marker
        position={[position.lat, position.lng]}
        draggable
        eventHandlers={{
          dragend: async (e) => {
            const marker = e.target;
            const pos = marker.getLatLng();
            setPosition(pos);
            const addr = await fetchAddress(pos.lat, pos.lng);
            setAddress(addr);
            onSelect?.(addr);
          },
        }}
      />
    );
  };

  // Load address for initial position on mount
  useEffect(() => {
    fetchAddress(initialPosition[0], initialPosition[1]).then((addr) => {
      setAddress(addr);
      onSelect?.(addr);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        style={{ height: "400px", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MarkerHandler />
      </MapContainer>

      {address?.address && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px 16px",
            background: "#f0fdf7",
            border: "1px solid #d1fae5",
            borderRadius: "8px",
            fontSize: "15px",
            color: "#065f46",
          }}
        >
          <strong style={{ color: "#01d28e" }}>Selected Location:</strong>{" "}
          {address.address}
        </div>
      )}
    </div>
  );
}
