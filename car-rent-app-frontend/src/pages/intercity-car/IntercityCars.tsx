import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./intercityCars.css";
import Navbar from "../../components/Navbar/Navbar";
import { MapPickerModal } from "../../components/common/LocationPickerModal";
import { searchIntercityCars } from "../../services/carService";
import { getRoadDistance } from "../../components/Map/RoadDistanceService";
import TripDistanceBadge from "../../components/Cars/TripDistanceBadge";

interface Car {
  id: number;
  make: string;
  model: string;
  year?: number;
  price_per_hour: number;
  photos: string[];
  city?: string;
  availableFrom?: string;
  availableTo?: string;
  available_from?: string;
  available_till?: string;
  price_per_km: number;
  documents?: {
    car_id: number;
    insurance_company: string;
    insurance_idv_value: string;
    insurance_image: string;
    owner_name: string;
    rc_image_back: string;
    rc_image_front: string;
    rc_number: string;
    rc_valid_till: string;
  };
}

function getDateAndTime(dateObj: Date) {
  const pad = (num: number) => num.toString().padStart(2, "0");
  return {
    date: `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(
      dateObj.getDate()
    )}`,
    time: `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`,
  };
}

export default function IntercityCars() {
  const navigate = useNavigate();
  const now = new Date();

  const pickupDefault = new Date(now);
  pickupDefault.setDate(pickupDefault.getDate() + 1);
  pickupDefault.setHours(9, 0, 0, 0);

  const { date, time } = getDateAndTime(pickupDefault);

  const [cars, setCars] = useState<Car[]>([]);
  const [pickupCity, setPickupCity] = useState("Delhi");
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDate, setPickupDate] = useState(date);
  const [pickupTime, setPickupTime] = useState(time);
  const [dropCity, setDropCity] = useState("");
  const [dropLocation, setDropLocation] = useState<any>(null);
  const [dropMapOpen, setDropMapOpen] = useState(false);
  const [tripDistanceKm, setTripDistanceKm] = useState<number | null>(null);

  const [sameCityError, setSameCityError] = useState(false);

  const [pax, setPax] = useState(1);
  const [luggage, setLuggage] = useState(0);
  const [loading, setLoading] = useState(false);

  const stationCoordinates: Record<string, { lat: number; lng: number }> = {
    "Indira Gandhi International Airport (DEL)": {
      lat: 28.5562,
      lng: 77.1,
    },
    "New Delhi Railway Station (NDLS)": {
      lat: 28.6438,
      lng: 77.2197,
    },
    "Agra Cantt Railway Station (AGC)": {
      lat: 27.1591,
      lng: 78.003,
    },
    "Greater Noida Railway Station (GNO)": {
      lat: 28.5076,
      lng: 77.5638,
    },
    "Sahibabad Railway Station (SBB)": {
      lat: 28.6739,
      lng: 77.3646,
    },
    "Noida Sector 51 Metro Station": {
      lat: 28.5857,
      lng: 77.3753,
    },
  };

  const cityStations: Record<string, string[]> = {
    Delhi: [
      "Indira Gandhi International Airport (DEL)",
      "New Delhi Railway Station (NDLS)",
      "Old Delhi Railway Station (DLI)",
      "Hazrat Nizamuddin Railway Station (NZM)",
      "Anand Vihar Terminal (ANVT)",
    ],
    Agra: [
      "Agra Cantt Railway Station (AGC)",
      "Agra Fort Railway Station (AF)",
      "Raja Ki Mandi Railway Station (RKM)",
      "Pandit Deen Dayal Upadhyaya Airport (AGR)",
    ],
    Jaipur: [
      "Jaipur Junction (JP)",
      "Gandhi Nagar Railway Station (GADJ)",
      "Jaipur International Airport (JAI)",
    ],
    Chandigarh: [
      "Chandigarh Railway Station (CDG)",
      "Chandigarh International Airport (IXC)",
    ],
    Lucknow: [
      "Charbagh Railway Station (LKO)",
      "Lucknow Junction (LJN)",
      "Chaudhary Charan Singh Airport (LKO)",
    ],
    Dehradun: ["Dehradun Railway Station (DDN)", "Jolly Grant Airport (DED)"],
    Amritsar: [
      "Amritsar Junction (ASR)",
      "Sri Guru Ram Dass Jee International Airport (ATQ)",
    ],
    Noida: [
      "Greater Noida Railway Station (GNO)",
      "Sahibabad Railway Station (SBB)",
      "Noida Sector 51 Metro Station",
    ],
  };

  const allCities = Object.keys(cityStations);

  const handleSearch = async () => {
    // Basic validations
    if (!pickupLocation || !dropLocation) {
      alert("Please select pickup station and drop address");
      return;
    }

    // Same city check (hard stop)
    if (pickupCity === dropLocation.city) {
      alert("Pickup city and drop city cannot be the same for intercity trips");
      return;
    }

    const coords = stationCoordinates[pickupLocation];
    if (!coords) {
      alert("Pickup coordinates not available");
      return;
    }

    setLoading(true);

    try {
      // Pickup datetime
      const pickup_datetime = new Date(
        `${pickupDate}T${pickupTime}`
      ).toISOString();

      // Call INTERCITY search API
      const data = await searchIntercityCars({
        pickup_location: {
          address: pickupLocation,
          city: pickupCity,
          latitude: coords.lat,
          longitude: coords.lng,
        },
        drop_location: {
          address: dropLocation.address,
          city: dropLocation.city,
          latitude: dropLocation.lat,
          longitude: dropLocation.lng,
        },
        pickup_datetime,
        pax,
        luggage,
      });

      const carsList = data?.cars || [];
      setCars(carsList);

      // Calculate trip distance ONCE (station → drop)
      const res = await getRoadDistance(
        {
          lat: coords.lat,
          lng: coords.lng,
        },
        {
          lat: dropLocation.lat,
          lng: dropLocation.lng,
        }
      );

      setTripDistanceKm(res.distanceKm);
    } catch (err) {
      console.error(err);
      alert("Failed to search intercity cars");
    } finally {
      setLoading(false);
    }
  };

  // SAME LOGIC AS searchedCars.tsx
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      // City filter - allows cars without city property
      if (
        pickupCity &&
        car.city &&
        car.city.toLowerCase() !== pickupCity.toLowerCase()
      )
        return false;

      // Date availability check
      const pickup = new Date(`${pickupDate}T${pickupTime}`);

      if (car.availableFrom && car.availableTo) {
        const from = new Date(car.availableFrom);
        const to = new Date(car.availableTo);
        if (pickup < from || pickup > to) return false;
      }

      // Check alternative property names
      if (car.available_from && car.available_till) {
        const from = new Date(car.available_from);
        const to = new Date(car.available_till);
        if (pickup < from || pickup > to) return false;
      }

      return true;
    });
  }, [cars, pickupCity, pickupDate, pickupTime]);

  return (
    <>
      <Navbar />

      {/* Filters */}
      <div className="searched-filters-panel">
        <label>
          Pickup City:
          <select
            value={pickupCity}
            onChange={(e) => {
              setPickupCity(e.target.value);
              setPickupLocation("");
              setDropCity("");
              setDropLocation(null);
              setTripDistanceKm(null);
              setCars([]);
            }}
          >
            {allCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label>
          Pickup Location:
          <select
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            required
          >
            <option value="" disabled>
              Select Location
            </option>
            {cityStations[pickupCity]?.map((station) => (
              <option key={station} value={station}>
                {station}
              </option>
            ))}
          </select>
        </label>

        <label>
          Pickup Date:
          <input
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
          />
        </label>

        <label>
          Pickup Time:
          <input
            type="time"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
          />
        </label>

        <label>
          Drop Address:
          <div className="location-input" onClick={() => setDropMapOpen(true)}>
            <input
              type="text"
              readOnly
              placeholder="Select drop location on map"
              value={dropLocation?.address || ""}
            />
          </div>
        </label>

        {sameCityError && (
          <p style={{ color: "red", fontSize: "0.9rem" }}>
            Pickup city and drop city cannot be the same for intercity trips
          </p>
        )}

        {/* PAX (+ -) */}
        <label>
          Passengers (PAX):
          <div className="searched-counter">
            <button
              type="button"
              onClick={() => setPax((prev) => Math.max(1, prev - 1))}
            >
              −
            </button>
            <span>{pax}</span>
            <button
              type="button"
              onClick={() => setPax((prev) => Math.min(6, prev + 1))}
            >
              +
            </button>
          </div>
        </label>

        {/* LUGGAGE (+ -) */}
        <label>
          Luggage:
          <div className="searched-counter">
            <button
              type="button"
              onClick={() => setLuggage((prev) => Math.max(0, prev - 1))}
            >
              −
            </button>
            <span>{luggage}</span>
            <button
              type="button"
              onClick={() => setLuggage((prev) => Math.min(5, prev + 1))}
            >
              +
            </button>
          </div>
        </label>

        <label className="searched-switch-label">
          Insure Trip:
          <span className="searched-switch">
            <input type="checkbox" checked readOnly />
            <span className="searched-slider"></span>
          </span>
        </label>

        <button
          className="searched-search-btn"
          onClick={handleSearch}
          disabled={loading || sameCityError || !dropLocation}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Banner */}
      <div className="searched-results-banner">
        <div className="searched-banner-content">
          <h2>Intercity Cars Available</h2>
          <p>
            Found {filteredCars.length.toString().padStart(2, "0")} intercity
            cars with driver
          </p>
        </div>
      </div>

      {/* Cars */}
      <div className="searched-cars-container">
        {loading ? (
          <p className="searched-no-cars">Searching for cars...</p>
        ) : filteredCars.length === 0 ? (
          <p className="searched-no-cars">
            No cars available. Click Search to find cars.
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
                  <p className="searched-car-price">₹{car.price_per_km} / km</p>
                  <p style={{ color: "#01d28e", fontSize: "0.9rem" }}>
                    Driver Included • Insurance Included
                  </p>
                  {tripDistanceKm &&
                    pickupLocation &&
                    stationCoordinates[pickupLocation] &&
                    dropLocation && (
                      <>
                        <TripDistanceBadge
                          pickup={{
                            lat: stationCoordinates[pickupLocation].lat,
                            lng: stationCoordinates[pickupLocation].lng,
                          }}
                          drop={{
                            lat: dropLocation.lat,
                            lng: dropLocation.lng,
                          }}
                        />
                        <p className="searched-car-price">
                          Total Trip Amount : ₹
                          {Math.round(tripDistanceKm * car.price_per_km)}
                        </p>

                        <p className="searched-car-price">Tolls/Taxes extra</p>
                      </>
                    )}
                </div>

                <div className="searched-car-actions">
                  <button
                    className="searched-btn-book"
                    onClick={() => {
                      const pickupCoords = stationCoordinates[pickupLocation];

                      navigate("/intercity/car", {
                        state: {
                          carId: car.id,

                          pickupLocation: {
                            address: pickupLocation,
                            lat: pickupCoords.lat,
                            lng: pickupCoords.lng,
                            city: pickupCity,
                          },

                          dropLocation, // already object from MapPickerModal

                          tripDistanceKm,
                          pricePerKm: car.price_per_km,
                          insureTrip: true,
                          dropCity,
                          pax,
                          luggage,
                        },
                      });
                    }}
                  >
                    Book now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <MapPickerModal
        isOpen={dropMapOpen}
        onClose={() => setDropMapOpen(false)}
        initialPosition={[
          dropLocation?.lat || 28.6139,
          dropLocation?.lng || 77.209,
        ]}
        onConfirm={(loc) => {
          if (loc.city === pickupCity) {
            setSameCityError(true);
            setDropLocation(null);
            return;
          }

          setSameCityError(false);
          setDropLocation(loc);
        }}
      />
    </>
  );
}
