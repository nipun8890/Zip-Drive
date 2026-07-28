import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./searchedCars.css";
import Navbar from "../../components/Navbar/Navbar";
import {
  LocationOptionsModal,
  MapPickerModal,
} from "../../components/common/LocationPickerModal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { searchCars } from "../../services/carService";
import CarDistanceBadge from "../../components/Cars/CarDistanceBadge";
import PickupDropBadge from "../../components/Cars/PickupDropBadge";

export type DropPricingType = "fixed" | "distance_based" | null;

export interface CarCapabilities {
  self_pickup: boolean;
  doorstep_drop: boolean;
  drop_pricing_type: DropPricingType;
  drop_amount: number | null;
}
interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  price_per_hour: number;
  photos: string[];
  city?: string;
  capabilities: CarCapabilities;
  pickup_location?: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
  };
  availableFrom: string;
  availableTo: string;
}

function getDateAndTime(dateObj: Date) {
  const pad = (num: number) => num.toString().padStart(2, "0");
  return {
    date: `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(
      dateObj.getDate(),
    )}`,
    time: `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`,
  };
}

export default function SearchedCars() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const now = new Date();

  const pickupDefault = new Date(now);
  pickupDefault.setDate(pickupDefault.getDate() + 1);
  pickupDefault.setHours(9, 0, 0, 0);

  const dropoffDefault = new Date(now);
  dropoffDefault.setDate(dropoffDefault.getDate() + 4);
  dropoffDefault.setHours(17, 0, 0, 0);

  const { date: defaultPickupDate, time: defaultPickupTime } =
    getDateAndTime(pickupDefault);
  const { date: defaultDropoffDate, time: defaultDropoffTime } =
    getDateAndTime(dropoffDefault);

  const bookingDetails = location.state?.bookingDetails || {};
  const initialCars = location.state?.cars || [];

  const [cars, setCars] = useState<Car[]>(initialCars);

  const [filters, setFilters] = useState({
    city: bookingDetails.city || "Delhi",
    pickupDate: bookingDetails.pickupDate || defaultPickupDate,
    pickupTime: bookingDetails.pickupTime || defaultPickupTime,
    dropDate: bookingDetails.dropDate || defaultDropoffDate,
    dropTime: bookingDetails.dropTime || defaultDropoffTime,
    driverRequired: bookingDetails.driverRequired ?? false,
    differentDrop: bookingDetails.differentDrop ?? false,
    insureTrip: bookingDetails.insureTrip ?? true,
  });

  const [dropCity, setDropCity] = useState("");
  const [pickupLocation, setPickupLocation] = useState<any>(null);
  const [pickupOptionsOpen, setPickupOptionsOpen] = useState(false);
  const [pickupMapOpen, setPickupMapOpen] = useState(false);

  const cities = ["Delhi", "Gurgaon", "Noida", "Agra", "Ahmedabad", "Jaipur"];

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSearch = async () => {
    try {
      const pickupDateTime = `${filters.pickupDate} ${filters.pickupTime}:00`;
      const dropoffDateTime = `${filters.dropDate} ${filters.dropTime}:00`;

      if (!pickupLocation?.lat || !pickupLocation?.lng) {
        alert("Pickup location not selected");
        return;
      }

      const data = await searchCars({
        pickup_location: {
          city: pickupLocation.city || filters.city,
          address: pickupLocation.address,
          latitude: pickupLocation.lat,
          longitude: pickupLocation.lng,
        },
        pickup_datetime: pickupDateTime,
        dropoff_datetime: dropoffDateTime,
      });

      setCars(data.cars || []);
    } catch {
      alert("Failed to fetch cars");
    }
  };

  const formatShortAddress = (address: string) => {
    if (!address) return "";
    return address.replace(/\s+/g, " ").trim();
  };

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      if (
        filters.city &&
        car.city &&
        car.city.toLowerCase() !== filters.city.toLowerCase()
      )
        return false;

      const pickup = new Date(`${filters.pickupDate}T${filters.pickupTime}`);
      const drop = new Date(`${filters.dropDate}T${filters.dropTime}`);

      if (car.availableFrom && car.availableTo) {
        const from = new Date(car.availableFrom);
        const to = new Date(car.availableTo);
        if (pickup < from || drop > to) return false;
      }

      return true;
    });
  }, [cars, filters]);

  return (
    <>
      <Navbar />

      {/* FILTER PANEL */}
      <div className="searched-filters-panel">
        <label>
          Pickup Address:
          <div
            style={{
              position: "relative",
              width: "100%",
              cursor: "pointer",
              borderRadius: "8px",
              overflow: "hidden",
            }}
            onClick={() => setPickupOptionsOpen(true)}
            onMouseEnter={(e) => {
              const input = e.currentTarget.querySelector("input");
              if (input) {
                input.style.borderColor = "#01d28e";
                input.style.boxShadow = "0 0 0 3px rgba(1, 210, 142, 0.15)";
                input.style.backgroundColor = "#f0fdf7";
              }
            }}
            onMouseLeave={(e) => {
              const input = e.currentTarget.querySelector("input");
              if (input) {
                input.style.borderColor = "#d1d5db";
                input.style.boxShadow = "none";
                input.style.backgroundColor = "#fff";
              }
            }}
          >
            <input
              type="text"
              value={
                pickupLocation ? formatShortAddress(pickupLocation.address) : ""
              }
              placeholder="Click to select pickup location"
              readOnly={true}
              style={{
                width: "100%",
                padding: "14px 48px 14px 16px",
                fontSize: "16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                backgroundColor: "#fff",
                cursor: "pointer",
                boxSizing: "border-box",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transition: "all 0.2s ease",
              }}
            />
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#01d28e",
                fontSize: "20px",
                pointerEvents: "none",
                transition: "color 0.2s ease",
              }}
            />
          </div>
        </label>

        {/* Rest of filters remain unchanged */}
        <label>
          Pickup Date:
          <input
            type="date"
            name="pickupDate"
            value={filters.pickupDate}
            onChange={handleFilterChange}
          />
        </label>

        <label>
          Pickup Time:
          <input
            type="time"
            name="pickupTime"
            value={filters.pickupTime}
            onChange={handleFilterChange}
          />
        </label>

        <label>
          Dropoff Date:
          <input
            type="date"
            name="dropDate"
            value={filters.dropDate}
            onChange={handleFilterChange}
          />
        </label>

        <label>
          Dropoff Time:
          <input
            type="time"
            name="dropTime"
            value={filters.dropTime}
            onChange={handleFilterChange}
          />
        </label>

        <label className="searched-switch-label">
          Driver Required:
          <span className="searched-switch">
            <input
              type="checkbox"
              name="driverRequired"
              checked={filters.driverRequired}
              onChange={handleFilterChange}
            />
            <span className="searched-slider" />
          </span>
        </label>

        <label className="searched-switch-label">
          Different Drop Location:
          <span className="searched-switch">
            <input
              type="checkbox"
              name="differentDrop"
              checked={filters.differentDrop}
              onChange={handleFilterChange}
            />
            <span className="searched-slider" />
          </span>
        </label>

        {filters.differentDrop && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <select
              value={dropCity}
              onChange={(e) => setDropCity(e.target.value)}
              style={{ flexGrow: 1 }}
            >
              <option value="" disabled>
                Select Drop-off City
              </option>
              {cities.map((city) => (
                <option key={city}>{city}</option>
              ))}
            </select>
          </div>
        )}

        <label className="searched-switch-label">
          Insure Trip:
          <span className="searched-switch">
            <input
              type="checkbox"
              name="insureTrip"
              checked={filters.insureTrip}
              onChange={handleFilterChange}
            />
            <span className="searched-slider" />
          </span>
        </label>

        <button className="searched-search-btn" onClick={handleSearch}>
          Search
        </button>
      </div>

      {/* BANNER */}
      <div className="searched-results-banner">
        <div className="searched-banner-content">
          <h2>Your Search results</h2>
          <p>
            Found {filteredCars.length.toString().padStart(2, "0")} cars for
            your dates & location, happy Zipping!
          </p>
        </div>
      </div>

      {/* CAR LIST */}
      <div className="searched-cars-container">
        {filteredCars.length === 0 ? (
          <p className="searched-no-cars">
            No cars found for the selected criteria.
          </p>
        ) : (
          <div className="searched-car-list">
            {filteredCars.map((car) => (
              <div key={car.id} className="searched-car-card">
                <div className="searched-car-image-wrapper">
                  <img
                    src={car.photos?.[0] || "/placeholder.png"}
                    className="searched-car-image"
                    alt={`${car.make} ${car.model}`}
                  />
                </div>

                <div className="searched-car-info">
                  <h3>
                    {car.make} {car.model}
                  </h3>
                  <p>Year: {car.year}</p>
                  {pickupLocation?.lat &&
                    pickupLocation?.lng &&
                    car.pickup_location?.latitude &&
                    car.pickup_location?.longitude && (
                      <CarDistanceBadge
                        pickup={{
                          lat: pickupLocation.lat,
                          lng: pickupLocation.lng,
                        }}
                        carLocation={{
                          lat: car.pickup_location?.latitude,
                          lng: car.pickup_location?.longitude,
                        }}
                      />
                    )}
                  <PickupDropBadge capabilities={car.capabilities} />

                  <p className="searched-car-price">
                    ₹{car.price_per_hour} / hour
                  </p>
                  {filters.insureTrip && (
                    <p style={{ color: "#01d28e", fontSize: "0.9rem" }}>
                      Trip Insurance Included
                    </p>
                  )}
                </div>

                <div className="searched-car-actions">
                  <button
                    className="searched-btn-book"
                    onClick={() => {
                      if (!isLoggedIn) {
                        // Option A: Navigate + state (preferred in your current setup)
                        navigate("/searched-cars", {
                          state: {
                            ...location.state, // preserve existing state if any
                            openLogin: true,
                            intendedCarId: car.id, // optional – useful for post-login redirect
                            intendedBookingDetails: {
                              ...filters,
                              dropCity,
                            },
                            intendedPickupLocation: pickupLocation,
                          },
                          replace: true, // ← prevents adding another history entry
                        });

                        // Option B (alternative – if you want to avoid navigation):
                        // setShowLoginModal(true);     // ← would require local state + modal in this component
                      } else {
                        navigate("/selfdrive/car", {
                          state: {
                            carId: car.id,
                            bookingDetails: { ...filters, dropCity },
                            pickupLocation,
                          },
                        });
                      }
                    }}
                  >
                    Book now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* ===== LOCATION MODALS ===== */}

        <LocationOptionsModal
          isOpen={pickupOptionsOpen}
          onClose={() => setPickupOptionsOpen(false)}
          title="Select Pickup Location"
          onUseCurrent={(loc) => {
            setPickupLocation(loc);
            setFilters((prev) => ({ ...prev, city: loc.city }));
          }}
          onPickOnMap={() => {
            setPickupOptionsOpen(false);
            setPickupMapOpen(true);
          }}
        />

        <MapPickerModal
          isOpen={pickupMapOpen}
          onClose={() => setPickupMapOpen(false)}
          initialPosition={[
            pickupLocation?.lat || 28.6139,
            pickupLocation?.lng || 77.209,
          ]}
          onConfirm={(loc) => {
            setPickupLocation(loc);
            setFilters((prev) => ({ ...prev, city: loc.city }));
          }}
        />
      </div>
    </>
  );
}
