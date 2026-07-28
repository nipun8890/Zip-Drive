// src/components/common/LocationPickerModal/MapPickerModal.tsx
import React from "react";
import LocationPicker from "../../Map/LocationPicker";
import "./LocationPickerModal.css";

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: any) => void;
  initialPosition: [number, number];
  title?: string;
}

export const MapPickerModal: React.FC<MapPickerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialPosition,
  title = "Select Location on Map",
}) => {
  const [selectedLocation, setSelectedLocation] = React.useState<any>(null);

  // This now matches the new LocationPicker's onSelect signature
  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onConfirm(selectedLocation);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="location-modal-overlay" onClick={onClose}>
      <div
        className="location-modal map-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="availability-modal-header">
          <h3 className="availability-modal-title">{title}</h3>
          <button onClick={onClose} className="availability-close-button">
            ✕
          </button>
        </div>

        {/* ✅ Correct props for the updated LocationPicker */}
        <LocationPicker
          initialPosition={initialPosition}
          onSelect={handleLocationSelect}
        />

        <button
          onClick={handleConfirm}
          className="availability-modal-confirm-button"
          disabled={!selectedLocation}
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
};
