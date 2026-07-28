import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Step6Availability.css";
import L from "leaflet";
import { uploadAvailability } from "../../services/carService";
// import { uploadAvailability } from "../../services/carService";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface CarFormData {
  expectedHourlyRent?: number;
  availabilityFrom?: string;
  availabilityTill?: string;
  serviceType?: "self-drive" | "intercity" | "both";
  selfDriveDropOffPolicy?: "flexible" | "no-service";
  flexibleDropOffRate?: number;
  fixedDropOffPrice?: number;
  intercityPricePerKm?: number;
  carLocation?: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
  };
}

interface AvailabilityProps {
  onSuccess: () => void;
  onBack: () => void;
  defaultValues: CarFormData;
  carId: number;
}

// LocationIQ utility function
const extractCityFromLocationIQ = (data: any): string => {
  const address = data.address || {};
  return (
    address.city ||
    address.town ||
    address.village ||
    address.state_district ||
    address.county ||
    address.state ||
    ""
  );
};

// Map component for location selection
const LocationPicker: React.FC<{
  position: [number, number];
  onLocationSelect: (lat: number, lng: number) => void;
}> = ({ position, onLocationSelect }) => {
  const [markerPosition, setMarkerPosition] =
    useState<[number, number]>(position);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        onLocationSelect(lat, lng);
      },
    });
    return null;
  };

  return (
    <MapContainer
      center={position}
      zoom={13}
      className="availability-map-container"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker
        position={markerPosition}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const pos = e.target.getLatLng();
            setMarkerPosition([pos.lat, pos.lng]);
            onLocationSelect(pos.lat, pos.lng);
          },
        }}
      />
      <MapEvents />
    </MapContainer>
  );
};
const mapServiceTypeToCarMode = (
  serviceType: "self-drive" | "intercity" | "both"
): "selfdrive" | "intercity" | "both" => {
  if (serviceType === "self-drive") return "selfdrive";
  return serviceType;
};

const mapDropPolicyToBackend = (
  policy: "flexible" | "no-service"
): "not_available" | "flexible" => {
  if (policy === "no-service") return "not_available";
  return policy;
};

const AvailabilityStep: React.FC<AvailabilityProps> = ({
  onSuccess,
  onBack,
  defaultValues,
  carId,
}) => {
  const [serviceType, setServiceType] = useState<
    "self-drive" | "intercity" | "both"
  >(defaultValues?.serviceType || "self-drive");
  const [expectedHourlyRent, setExpectedHourlyRent] = useState<number>(
    defaultValues?.expectedHourlyRent || 0
  );
  const [availabilityFrom, setAvailabilityFrom] = useState<string>(
    defaultValues?.availabilityFrom || ""
  );
  const [availabilityTill, setAvailabilityTill] = useState<string>(
    defaultValues?.availabilityTill || ""
  );

  // Self-drive specific states
  const [selfDriveDropOffPolicy, setSelfDriveDropOffPolicy] = useState<
    "flexible" | "no-service"
  >(defaultValues?.selfDriveDropOffPolicy || "flexible");
  const [flexibleDropOffRate, setFlexibleDropOffRate] = useState<number>(
    defaultValues?.flexibleDropOffRate || 0
  );

  // Intercity specific states
  const [intercityPricePerKm, setIntercityPricePerKm] = useState<number>(
    defaultValues?.intercityPricePerKm || 0
  );

  // Car location states
  const [carLocation, setCarLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    city?: string;
    state?: string;
  }>(defaultValues?.carLocation || { lat: 28.6139, lng: 77.209, address: "" });

  const [showPickupOptions, setShowPickupOptions] = useState(false);
  const [showPickupMap, setShowPickupMap] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Handle location selection from map
  const handleLocationSelect = async (lat: number, lng: number) => {
    try {
      const token = import.meta.env.VITE_LOCATIONIQ_TOKEN;
      if (!token) {
        throw new Error("LocationIQ API token is missing.");
      }

      const response = await fetch(
        `https://us1.locationiq.com/v1/reverse.php?key=${token}&lat=${lat}&lon=${lng}&format=json&addressdetails=1&normalizeaddress=1`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch address.");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const city = extractCityFromLocationIQ(data);

      setCarLocation({
        lat,
        lng,
        address: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        city,
        state: data.address?.state || "",
      });
    } catch (error) {
      console.error("Error fetching address:", error);
      setCarLocation({
        lat,
        lng,
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      });
    }
  };

  // Handle current location detection
  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            (error) => {
              let message = "Unable to retrieve your location.";
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  message =
                    "Location access denied. Please enable location permissions.";
                  break;
                case error.POSITION_UNAVAILABLE:
                  message = "Location information is unavailable.";
                  break;
                case error.TIMEOUT:
                  message = "Location request timed out.";
                  break;
              }
              reject(new Error(message));
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0,
            }
          );
        }
      );

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const token = import.meta.env.VITE_LOCATIONIQ_TOKEN;
      if (!token) {
        throw new Error("LocationIQ API token is missing.");
      }

      const response = await fetch(
        `https://us1.locationiq.com/v1/reverse.php?key=${token}&lat=${lat}&lon=${lng}&format=json&addressdetails=1&normalizeaddress=1`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch address. Please try again.");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const city = extractCityFromLocationIQ(data);

      setCarLocation({
        lat,
        lng,
        address: data.display_name,
        city,
        state: data.address?.state || "",
      });

      setShowPickupOptions(false);
    } catch (err: any) {
      alert(
        err.message || "Failed to detect your location. Please pick manually."
      );
      console.error("Location detection error:", err);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const formatShortAddress = (address: string) => {
    if (!address) return "";
    return address.replace(/\s+/g, " ").trim();
  };
  const handleNext = async () => {
    // 🔎 Basic validation
    if (!availabilityFrom || !availabilityTill) {
      alert("Please select availability dates.");
      return;
    }

    if (!carLocation.address) {
      alert("Please set car location.");
      return;
    }

    if (
      (serviceType === "self-drive" || serviceType === "both") &&
      !expectedHourlyRent
    ) {
      alert("Please enter hourly rent.");
      return;
    }

    if (
      (serviceType === "intercity" || serviceType === "both") &&
      !intercityPricePerKm
    ) {
      alert("Please enter intercity price per km.");
      return;
    }

    if (serviceType !== "intercity") {
      if (selfDriveDropOffPolicy === "flexible" && !flexibleDropOffRate) {
        alert("Please enter flexible drop-off rate.");
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload = {
        car_id: carId,
        car_mode: mapServiceTypeToCarMode(serviceType),

        available_from: availabilityFrom,
        available_till: availabilityTill,

        price_per_hour:
          serviceType === "self-drive" || serviceType === "both"
            ? expectedHourlyRent
            : null,

        price_per_km:
          serviceType === "intercity" || serviceType === "both"
            ? intercityPricePerKm
            : null,

        selfdrive_drop_policy:
          serviceType === "self-drive" || serviceType === "both"
            ? mapDropPolicyToBackend(selfDriveDropOffPolicy)
            : "not_available",

        selfdrive_drop_amount:
          selfDriveDropOffPolicy === "flexible" ? flexibleDropOffRate : null,

        car_location: {
          address: carLocation.address,
          city: carLocation.city || "",
          lat: carLocation.lat,
          lng: carLocation.lng,
        },
      };

      await uploadAvailability(payload);

      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Error saving availability.");
    } finally {
      setSubmitting(false);
    }
  };

  const showSelfDrive = serviceType === "self-drive" || serviceType === "both";
  const showIntercity = serviceType === "intercity" || serviceType === "both";

  return (
    <div className="availability-container">
      <div className="availability-header">
        <h2 className="availability-title">Availability & Service Type</h2>
        <p className="availability-subtitle">
          Configure your car's availability and service options
        </p>
      </div>

      {/* Triple Toggle Switch */}
      <div className="availability-toggle-container">
        <label className="availability-label">Service Type</label>
        <div className="availability-toggle-wrapper">
          <button
            onClick={() => setServiceType("self-drive")}
            className={`availability-toggle-button ${
              serviceType === "self-drive" ? "active" : ""
            }`}
          >
            <span className="availability-toggle-text">Self-Drive</span>
          </button>
          <button
            onClick={() => setServiceType("intercity")}
            className={`availability-toggle-button ${
              serviceType === "intercity" ? "active" : ""
            }`}
          >
            <span className="availability-toggle-text">Intercity</span>
          </button>
          <button
            onClick={() => setServiceType("both")}
            className={`availability-toggle-button ${
              serviceType === "both" ? "active" : ""
            }`}
          >
            <span className="availability-toggle-text">Both</span>
          </button>
        </div>
      </div>

      {/* Common Fields */}

      <div className="availability-form-row">
        <div className="availability-form-group">
          <label className="availability-label">Availability From</label>
          <input
            type="date"
            value={availabilityFrom}
            onChange={(e) => setAvailabilityFrom(e.target.value)}
            className="availability-input"
          />
        </div>
        <div className="availability-form-group">
          <label className="availability-label">Availability Till</label>
          <input
            type="date"
            value={availabilityTill}
            onChange={(e) => setAvailabilityTill(e.target.value)}
            className="availability-input"
          />
        </div>
      </div>

      {/* Car Location (Common) */}
      <div className="availability-form-group">
        <label className="availability-label">Car Location</label>
        <div className="availability-location-input-wrapper">
          <input
            type="text"
            value={
              carLocation.address ? formatShortAddress(carLocation.address) : ""
            }
            readOnly
            placeholder="Click to select car location"
            className="availability-location-input"
            onClick={() => setShowPickupOptions(true)}
          />
          <button
            onClick={() => setShowPickupOptions(true)}
            className="availability-location-button"
          >
            📍
          </button>
        </div>
        {carLocation.address && (
          <div className="availability-location-preview">
            📍 {carLocation.address}
          </div>
        )}
      </div>

      {/* Self-Drive Section */}
      {showSelfDrive && (
        <div className="availability-section">
          <h3 className="availability-section-title">
            🚗 Self-Drive Configuration
          </h3>

          <div className="availability-form-group">
            <label className="availability-label">
              Expected Hourly Rent (₹)/hr
            </label>
            <input
              type="number"
              placeholder="Enter amount in INR e.g., 500"
              value={expectedHourlyRent || ""}
              onChange={(e) => setExpectedHourlyRent(Number(e.target.value))}
              className="availability-input"
            />
            <label className="availability-label">Drop-Off Policy</label>
            <div className="availability-radio-group">
              <label className="availability-radio-label">
                <input
                  type="radio"
                  name="dropOffPolicy"
                  checked={selfDriveDropOffPolicy === "flexible"}
                  onChange={() => setSelfDriveDropOffPolicy("flexible")}
                  className="availability-radio"
                />
                <div>
                  <strong>Flexible Drop-Off</strong>
                  <p className="availability-radio-description">
                    Charge per kilometer
                  </p>
                </div>
              </label>
              {selfDriveDropOffPolicy === "flexible" && (
                <div className="availability-nested-input">
                  <label className="availability-label">Rate per KM (₹)</label>
                  <input
                    type="number"
                    placeholder="Enter rate per km e.g., 10"
                    value={flexibleDropOffRate || ""}
                    onChange={(e) =>
                      setFlexibleDropOffRate(Number(e.target.value))
                    }
                    className="availability-input"
                  />
                </div>
              )}

              <label className="availability-radio-label">
                <input
                  type="radio"
                  name="dropOffPolicy"
                  checked={selfDriveDropOffPolicy === "no-service"}
                  onChange={() => setSelfDriveDropOffPolicy("no-service")}
                  className="availability-radio"
                />
                <div>
                  <strong>No Drop-Off Service</strong>
                  <p className="availability-radio-description">
                    Customer returns to pickup location
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Intercity Section */}
      {showIntercity && (
        <div className="availability-section">
          <h3 className="availability-section-title">
            🛣️ Intercity Configuration
          </h3>

          <div className="availability-form-group">
            <label className="availability-label">
              Price per Kilometer (₹)
            </label>
            <input
              type="number"
              placeholder="Enter price per km"
              value={intercityPricePerKm || ""}
              onChange={(e) => setIntercityPricePerKm(Number(e.target.value))}
              className="availability-input"
            />
            <p className="availability-help-text">
              This rate will be charged for intercity travel
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="availability-form-actions">
        <button
          onClick={onBack}
          disabled={submitting}
          className="availability-back-button"
        >
          ⬅ Back
        </button>
        <button
          onClick={handleNext}
          disabled={submitting}
          className="availability-next-button"
        >
          {submitting ? "Submitting..." : "Submit ✅"}
        </button>
      </div>

      {/* PICKUP OPTIONS MODAL */}
      {showPickupOptions && (
        <div
          className="location-modal-overlay"
          onClick={() => setShowPickupOptions(false)}
        >
          <div className="location-modal" onClick={(e) => e.stopPropagation()}>
            <div className="location-modal-header">
              <h2>Select Car Location</h2>
              <p>Choose how you'd like to set your car's address</p>
            </div>

            <div className="location-modal-body">
              <button
                className="location-option-btn current-location"
                onClick={handleUseCurrentLocation}
                disabled={isDetectingLocation}
                style={{
                  opacity: isDetectingLocation ? 0.7 : 1,
                  cursor: isDetectingLocation ? "not-allowed" : "pointer",
                }}
              >
                <div className="option-icon">
                  {isDetectingLocation ? "⌛" : "📍"}
                </div>
                <div className="option-content">
                  <h3>
                    {isDetectingLocation
                      ? "Detecting your location..."
                      : "Use Current Location"}
                  </h3>
                  <p>
                    {isDetectingLocation
                      ? "Please wait while we find you"
                      : "Automatically detect your current position"}
                  </p>
                </div>
              </button>

              <button
                className="location-option-btn map-location"
                onClick={() => {
                  setShowPickupOptions(false);
                  setShowPickupMap(true);
                }}
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
      )}

      {/* PICKUP MAP MODAL */}
      {showPickupMap && (
        <div
          className="location-modal-overlay"
          onClick={() => setShowPickupMap(false)}
        >
          <div
            className="location-modal map-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="availability-modal-header">
              <h3 className="availability-modal-title">
                Select Car Location on Map
              </h3>
              <button
                onClick={() => setShowPickupMap(false)}
                className="availability-close-button"
              >
                ✕
              </button>
            </div>
            <LocationPicker
              position={[carLocation.lat, carLocation.lng]}
              onLocationSelect={handleLocationSelect}
            />
            <button
              onClick={() => setShowPickupMap(false)}
              className="availability-modal-confirm-button"
            >
              Confirm Location
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityStep;
