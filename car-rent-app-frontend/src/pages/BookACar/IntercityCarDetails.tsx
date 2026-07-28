import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import CarTabs from "../../components/CarTabs/CarsTab";
import IntercityChargesCard from "../../components/ChargesCard/IntercityChargesCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { getCarDetails } from "../../services/carDetails";
import { bookCarIntercity } from "../../services/booking";
import type { CarDetailsType } from "../../types/CarDetails";
import "./BookACar.css";

const IntercityCarDetails: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.carId) {
    navigate("/intercity-cars", { replace: true });
    return null;
  }

  const {
    carId,
    pickupLocation,
    dropLocation,
    tripDistanceKm,
    insureTrip = true,
    dropCity,
    pricePerKm,
    pax,
    luggage,
  } = state;

  const [car, setCar] = useState<CarDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [pricing, setPricing] = useState<{
    baseFare: number;
    driverFee: number;
    gst: number;
    total: number;
  }>({
    baseFare: 0,
    driverFee: 0,
    gst: 0,
    total: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const carData = await getCarDetails(Number(carId));
        setCar(carData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [carId]);

  const nextImage = () => {
    if (car?.photos?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % car.photos.length);
    }
  };

  const prevImage = () => {
    if (car?.photos?.length) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + car.photos.length) % car.photos.length,
      );
    }
  };

  const handleBookNow = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login");
        return;
      }

      await bookCarIntercity(
        {
          car_id: carId,

          pickup_address: pickupLocation.address,
          pickup_lat: pickupLocation.lat,
          pickup_long: pickupLocation.lng,

          drop_address: dropLocation.address,
          drop_lat: dropLocation.lat,
          drop_long: dropLocation.lng,

          pax,
          luggage,
          distance_km: tripDistanceKm,
          driver_amount: pricing.driverFee,

          total_amount: pricing.total,

          payment_mode: "ZERO_RS", // 🔥 ADD THIS
        },
        token,
      );

      navigate("/guest-mybookings");
      alert(" Intercity Booking successful!");
    } catch (e: any) {
      alert(e.message || "Booking failed");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="book-car-container">
          <div className="loading-spinner">Loading...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (!car) return null;

  return (
    <>
      <Navbar />

      <div className="book-car-container">
        {/* LEFT SECTION - Car details */}
        <div className="car-details-section">
          <button className="back-button" onClick={() => navigate(-1)}>
            ←
          </button>

          <h1 className="car-title">
            {car.make} {car.model}
          </h1>

          {car.photos?.length > 0 && (
            <div className="carousel">
              <img
                src={car.photos[currentImageIndex].photo_url}
                alt={car.model}
                className="carousel-image"
              />
              <button className="prev" onClick={prevImage}>
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button className="next" onClick={nextImage}>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          )}

          <CarTabs car={car} />
        </div>

        {/* RIGHT SECTION - Intercity Charges Card */}
        <div className="booking-section">
          <IntercityChargesCard
            pickupStation={pickupLocation}
            pickupCity={pickupLocation.city}
            dropAddress={dropLocation?.address || ""}
            dropCity={dropCity || dropLocation?.city || ""}
            tripKm={tripDistanceKm || 0}
            pricePerKm={pricePerKm || 0}
            insureTrip={insureTrip}
            pax={pax} // ✅ ADD
            luggage={luggage}
            onPriceChange={setPricing}
            onPay={handleBookNow}
          />
        </div>
      </div>

      <Footer />
    </>
  );
};

export default IntercityCarDetails;
