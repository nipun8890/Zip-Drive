import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { getHostBookings } from "../../services/booking";
import DropOTP from "../../components/DropOTP/DropOTP";
import "./host-mybookings.css";

type HostBooking = {
  id: number;
  status: string;
  total_amount: number;
  paid_amount: number;
  payment_status: string;
  booking_type: string;
  createdAt: string;
  updatedAt: string;
  Car: {
    id: number;
    year: number;
    description: string;
    photos?: { id: number; photo_url: string }[];
    make: {
      name: string;
    };
    model: {
      name: string;
    };
  };
  SelfDriveBooking: {
    start_datetime: string;
    end_datetime: string;
    pickup_address: string;
    drop_address: string;
    base_amount: number;
    insure_amount: number;
    driver_amount: number;
    drop_charge: number;
    gst_amount: number;
    total_amount: number;
  } | null;
  IntercityBooking: {
    pickup_address: string;
    drop_address: string;
    pickup_lat: string;
    pickup_long: string;
    drop_lat: string;
    drop_long: string;
    pax: number;
    luggage: number;
    distance_km: string;
    driver_amount: number;
    base_amount: number;
    gst_amount: number;
    total_amount: number;
  } | null;
  guest: {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
};

export default function HostMyBookings() {
  const [bookings, setBookings] = useState<HostBooking[]>([]);
  const [copiedPhone, setCopiedPhone] = useState<number | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";

  const fetchBookings = async () => {
    try {
      if (!token) return;
      const data = await getHostBookings(token);
      // Sort bookings by creation date, latest first
      const sortedData = data.sort(
        (a: HostBooking, b: HostBooking) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setBookings(sortedData);
    } catch (err) {
      console.error("Error loading host bookings", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const handleViewCar = (carId: number) => {
    navigate(`/car-details/${carId}`);
  };

  const handlePhoneClick = async (phone: string, bookingId: number) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhone(bookingId);
      setTimeout(() => setCopiedPhone(null), 2000);
      window.location.href = `tel:${phone}`;
    } catch (err) {
      console.error("Failed to copy phone number", err);
      window.location.href = `tel:${phone}`;
    }
  };

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleChatClick = (guest: HostBooking["guest"]) => {
    alert(
      `Chat feature coming soon! Guest: ${guest.first_name} ${guest.last_name}`,
    );
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "status-active";
      case "CONFIRMED":
        return "status-confirmed";
      case "COMPLETED":
        return "status-completed";
      case "CANCELLED":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  const calculateHostEarnings = (
    baseAmount: number,
    dropCharge: number = 0,
  ) => {
    const platformFee = baseAmount * 0.1; // 10% platform fee on base amount only
    const baseAfterFee = baseAmount - platformFee;
    const hostEarnings = baseAfterFee + dropCharge; // Add drop charge to earnings
    return { platformFee, baseAfterFee, hostEarnings };
  };

  if (bookings.length === 0) {
    return (
      <>
        <Navbar />
        <div className="host-mybookings-container">
          <div className="empty-state">
            <h2>No bookings for your cars yet.</h2>
            <p>Your bookings will appear here once guests make reservations.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="host-mybookings-container">
        <div className="page-header">
          <h1>Bookings for Your Cars</h1>
          <p className="subtitle">Manage your vehicle reservations</p>
        </div>

        <div className="bookings-list">
          {bookings.map((booking) => {
            const car = booking.Car;
            const guest = booking.guest;
            const sd = booking.SelfDriveBooking;
            const ic = booking.IntercityBooking;

            // Skip if neither booking type exists
            if (!sd && !ic) return null;

            const image = car?.photos?.[0]?.photo_url || "/default-car.png";
            const bookingDate = new Date(
              booking.createdAt,
            ).toLocaleDateString();

            // Calculate platform fee and host earnings
            // Platform fee is 10% of base amount only
            // Host earnings = (base amount - platform fee) + drop charges
            const baseAmount = sd ? sd.base_amount : ic ? ic.base_amount : 0;
            const dropCharge = sd ? sd.drop_charge : 0;
            const { platformFee, hostEarnings } = calculateHostEarnings(
              baseAmount,
              dropCharge,
            );

            // ===== SELF DRIVE BOOKING =====
            if (sd) {
              const startDate = new Date(sd.start_datetime);
              const endDate = new Date(sd.end_datetime);

              const pickupDate = startDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC", // This keeps it at Jan 30
              });

              const pickupTime = startDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "UTC", // This keeps it at 07:00 PM
              });

              const dropoffDate = endDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC", // This keeps it at Jan 31
              });

              const dropoffTime = endDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "UTC", // This keeps it at 12:00 PM
              });

              // totalHours remains the same as it calculates absolute time difference
              const totalHours = Math.max(
                1,
                Math.round(
                  (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60),
                ),
              );

              return (
                <div key={booking.id} className="booking-card">
                  {/* Left Section - Car Image */}
                  <div className="booking-image-section">
                    <img
                      src={image}
                      alt={`${car.make.name} ${car.model.name}`}
                      className="booking-car-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/default-car.png";
                      }}
                    />
                    <span className="booking-type-badge-overlay">
                      Self Drive
                    </span>
                  </div>

                  {/* Middle Section - Main Details */}
                  <div className="booking-main-details">
                    <div className="booking-header-inline">
                      <div className="booking-id-section">
                        <span className="booking-label">Booking ID</span>
                        <span className="booking-id">#{booking.id}</span>
                      </div>
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          booking.status,
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="car-info-inline">
                      <h3 className="car-title">
                        {car.make.name} {car.model.name}
                      </h3>
                      <p className="car-year">{car.year}</p>
                    </div>

                    <div className="trip-details-grid">
                      <div className="trip-detail-item">
                        <span className="detail-icon">📍</span>
                        <div className="detail-content">
                          <span className="detail-label">Pickup</span>
                          <span className="detail-value">
                            {sd.pickup_address}
                          </span>
                          <span className="detail-time">
                            {pickupDate} at {pickupTime}
                          </span>
                        </div>
                      </div>

                      <div className="trip-detail-item">
                        <span className="detail-icon">🏁</span>
                        <div className="detail-content">
                          <span className="detail-label">Drop-off</span>
                          <span className="detail-value">
                            {sd.drop_address}
                          </span>
                          <span className="detail-time">
                            {dropoffDate} at {dropoffTime}
                          </span>
                        </div>
                      </div>

                      <div className="trip-detail-item">
                        <span className="detail-icon">⏱️</span>
                        <div className="detail-content">
                          <span className="detail-label">Duration</span>
                          <span className="detail-value">
                            {totalHours} hours
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="guest-info-inline">
                      <div className="guest-header-row">
                        <span className="guest-icon">👤</span>
                        <div className="guest-details">
                          <span className="guest-name">
                            {guest.first_name} {guest.last_name}
                          </span>
                          <span className="guest-contact">{guest.phone}</span>
                          {guest.email && (
                            <span className="guest-email">{guest.email}</span>
                          )}
                        </div>
                      </div>
                      <div className="guest-actions">
                        <button
                          className="action-btn call-btn"
                          onClick={() =>
                            handlePhoneClick(guest.phone, booking.id)
                          }
                          title={`Call ${guest.phone}`}
                        >
                          📞
                        </button>
                        {copiedPhone === booking.id && (
                          <span className="copied-toast">Copied!</span>
                        )}
                        {guest.email && (
                          <button
                            className="action-btn email-btn"
                            onClick={() => handleEmailClick(guest.email)}
                            title={`Email ${guest.email}`}
                          >
                            ✉️
                          </button>
                        )}
                        <button
                          className="action-btn chat-btn"
                          onClick={() => handleChatClick(guest)}
                          title="Chat with guest"
                        >
                          💬
                        </button>
                      </div>
                    </div>

                    {/* ✅ DROP OTP COMPONENT - Below guest contact section */}
                    <DropOTP
                      bookingId={booking.id}
                      dropDateTime={sd.end_datetime}
                      bookingStatus={booking.status}
                      onOtpVerified={fetchBookings}
                    />
                  </div>

                  {/* Right Section - Pricing */}
                  <div className="booking-pricing-section">
                    <h4 className="pricing-title">Your Earnings</h4>

                    <div className="price-summary">
                      <div className="price-row">
                        <span className="price-label">Base Amount</span>
                        <span className="price-value">
                          ₹{baseAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="price-row platform-fee-row">
                        <span className="price-label">Platform Fee (10%)</span>
                        <span className="price-value negative">
                          -₹{platformFee.toFixed(2)}
                        </span>
                      </div>
                      <div className="price-row">
                        <span className="price-label">Drop Charge</span>
                        <span className="price-value">
                          ₹{dropCharge.toLocaleString()}
                        </span>
                      </div>
                      <div className="price-row earnings-row">
                        <span className="price-label">You Will Receive</span>
                        <span className="price-value earnings">
                          ₹{hostEarnings.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="payment-status-inline">
                      <span className="payment-label">Payment:</span>
                      <span
                        className={`payment-badge ${booking.payment_status.toLowerCase()}`}
                      >
                        {booking.payment_status}
                      </span>
                    </div>

                    <div className="booking-actions">
                      <span className="booking-date">{bookingDate}</span>
                      <button
                        className="view-details-btn"
                        onClick={() => handleViewCar(car.id)}
                      >
                        View Car
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // ===== INTERCITY BOOKING =====
            if (ic) {
              const distanceKm = parseFloat(ic.distance_km || "0");

              return (
                <div key={booking.id} className="booking-card">
                  {/* Left Section - Car Image */}
                  <div className="booking-image-section">
                    <img
                      src={image}
                      alt={`${car.make.name} ${car.model.name}`}
                      className="booking-car-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/default-car.png";
                      }}
                    />
                    <span className="booking-type-badge-overlay intercity">
                      Intercity
                    </span>
                  </div>

                  {/* Middle Section - Main Details */}
                  <div className="booking-main-details">
                    <div className="booking-header-inline">
                      <div className="booking-id-section">
                        <span className="booking-label">Booking ID</span>
                        <span className="booking-id">#{booking.id}</span>
                      </div>
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          booking.status,
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="car-info-inline">
                      <h3 className="car-title">
                        {car.make.name} {car.model.name}
                      </h3>
                      <p className="car-year">{car.year}</p>
                    </div>

                    <div className="trip-details-grid">
                      <div className="trip-detail-item">
                        <span className="detail-icon">📍</span>
                        <div className="detail-content">
                          <span className="detail-label">Pickup</span>
                          <span className="detail-value">
                            {ic.pickup_address}
                          </span>
                        </div>
                      </div>

                      <div className="trip-detail-item">
                        <span className="detail-icon">🏁</span>
                        <div className="detail-content">
                          <span className="detail-label">Drop-off</span>
                          <span className="detail-value">
                            {ic.drop_address}
                          </span>
                        </div>
                      </div>

                      <div className="trip-detail-item">
                        <span className="detail-icon">🚗</span>
                        <div className="detail-content">
                          <span className="detail-label">Distance</span>
                          <span className="detail-value">
                            {distanceKm.toFixed(2)} km
                          </span>
                        </div>
                      </div>

                      <div className="trip-detail-item">
                        <span className="detail-icon">👥</span>
                        <div className="detail-content">
                          <span className="detail-label">Passengers</span>
                          <span className="detail-value">{ic.pax}</span>
                        </div>
                      </div>

                      <div className="trip-detail-item">
                        <span className="detail-icon">🧳</span>
                        <div className="detail-content">
                          <span className="detail-label">Luggage</span>
                          <span className="detail-value">{ic.luggage}</span>
                        </div>
                      </div>
                    </div>

                    <div className="guest-info-inline">
                      <div className="guest-header-row">
                        <span className="guest-icon">👤</span>
                        <div className="guest-details">
                          <span className="guest-name">
                            {guest.first_name} {guest.last_name}
                          </span>
                          <span className="guest-contact">{guest.phone}</span>
                          {guest.email && (
                            <span className="guest-email">{guest.email}</span>
                          )}
                        </div>
                      </div>
                      <div className="guest-actions">
                        <button
                          className="action-btn call-btn"
                          onClick={() =>
                            handlePhoneClick(guest.phone, booking.id)
                          }
                          title={`Call ${guest.phone}`}
                        >
                          📞
                        </button>
                        {copiedPhone === booking.id && (
                          <span className="copied-toast">Copied!</span>
                        )}
                        {guest.email && (
                          <button
                            className="action-btn email-btn"
                            onClick={() => handleEmailClick(guest.email)}
                            title={`Email ${guest.email}`}
                          >
                            ✉️
                          </button>
                        )}
                        <button
                          className="action-btn chat-btn"
                          onClick={() => handleChatClick(guest)}
                          title="Chat with guest"
                        >
                          💬
                        </button>
                      </div>
                    </div>

                    {/* ✅ DROP OTP COMPONENT - For intercity, use createdAt as placeholder */}
                    <DropOTP
                      bookingId={booking.id}
                      dropDateTime={booking.createdAt}
                      bookingStatus={booking.status}
                      onOtpVerified={fetchBookings}
                    />
                  </div>

                  {/* Right Section - Pricing */}
                  <div className="booking-pricing-section">
                    <h4 className="pricing-title">Your Earnings</h4>

                    <div className="price-summary">
                      <div className="price-row">
                        <span className="price-label">Base Amount</span>
                        <span className="price-value">
                          ₹{baseAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="price-row">
                        <span className="price-label">Drop Charge</span>
                        <span className="price-value">
                          ₹{dropCharge.toLocaleString()}
                        </span>
                      </div>
                      <div className="price-row platform-fee-row">
                        <span className="price-label">Platform Fee (10%)</span>
                        <span className="price-value negative">
                          -₹{platformFee.toFixed(2)}
                        </span>
                      </div>

                      <div className="price-row earnings-row">
                        <span className="price-label">You Will Receive</span>
                        <span className="price-value earnings">
                          ₹{hostEarnings.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="payment-status-inline">
                      <span className="payment-label">Payment:</span>
                      <span
                        className={`payment-badge ${booking.payment_status.toLowerCase()}`}
                      >
                        {booking.payment_status}
                      </span>
                    </div>

                    <div className="booking-actions">
                      <span className="booking-date">{bookingDate}</span>
                      <button
                        className="view-details-btn"
                        onClick={() => handleViewCar(car.id)}
                      >
                        View Car
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </>
  );
}
