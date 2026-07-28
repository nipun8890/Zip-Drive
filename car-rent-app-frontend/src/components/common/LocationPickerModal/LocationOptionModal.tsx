// src/components/common/LocationPickerModal/LocationOptionsModal.tsx
import React from "react";
import "./LocationPickerModal.css";
import { useCurrentLocation } from "./useCurrentLocation";

interface LocationOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseCurrent: (location: any) => void;
  onPickOnMap: () => void;
  title: string;
  subtitle?: string;
}

export const LocationOptionsModal: React.FC<LocationOptionsModalProps> = ({
  isOpen,
  onClose,
  onUseCurrent,
  onPickOnMap,
  title,
  subtitle = "Choose how you'd like to set the location",
}) => {
  const { getCurrentLocation } = useCurrentLocation();
  const [detecting, setDetecting] = React.useState(false);

  const handleCurrentLocation = async () => {
    setDetecting(true);
    try {
      const location = await getCurrentLocation();
      onUseCurrent(location);
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to detect location.");
    } finally {
      setDetecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="location-modal-overlay" onClick={onClose}>
      <div className="location-modal" onClick={(e) => e.stopPropagation()}>
        <div className="location-modal-header">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="location-modal-body">
          <button
            className="location-option-btn current-location"
            onClick={handleCurrentLocation}
            disabled={detecting}
          >
            <div className="option-icon">{detecting ? "⌛" : "📍"}</div>
            <div className="option-content">
              <h3>
                {detecting
                  ? "Detecting your location..."
                  : "Use Current Location"}
              </h3>
              <p>
                {detecting
                  ? "Please wait..."
                  : "Automatically detect your position"}
              </p>
            </div>
          </button>

          <button
            className="location-option-btn map-location"
            onClick={onPickOnMap}
          >
            <div className="option-icon">🗺️</div>
            <div className="option-content">
              <h3>Pick on Map</h3>
              <p>Choose a location by browsing the map</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
