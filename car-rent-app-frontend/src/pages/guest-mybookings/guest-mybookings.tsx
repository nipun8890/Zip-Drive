import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { getGuestBookings } from "../../services/booking";
import PickupOTP from "../../components/PickupOTP/PickupOTP";
import { toIST } from "../../utils/time";

import "./guest-mybooking.css";

type SelfDriveBooking = {
  start_datetime: string;
  end_datetime: string;
  pickup_address: string;
  drop_address: string;
};

type IntercityBooking = {
  pickup_address: string;
  drop_address: string;
  distance_km: string;
  driver_amount: number;
  pax: number;
  luggage: number;
};

type CarMake = string | { name: string };
type CarModel = string | { name: string };

type Booking = {
  id: number;
  booking_type: "SELF_DRIVE" | "INTERCITY";
  status: string;
  total_amount: number;
  createdAt: string;
  Car: {
    id: number;
    make?: CarMake;
    model?: CarModel;
    year?: number;
    description?: string;
    photos?: { photo_url: string }[];
    host?: {
      id: number;
      first_name: string;
      last_name: string;
      phone: string;
      email?: string;
    };
  };
  SelfDriveBooking?: SelfDriveBooking | null;
  IntercityBooking?: IntercityBooking | null;
};

// Helper functions
const getMakeName = (make?: CarMake) => {
  if (!make) return "Unknown Make";
  return typeof make === "string" ? make : make.name || "Unknown Make";
};
const getModelName = (model?: CarModel) => {
  if (!model) return "Unknown Model";
  return typeof model === "string" ? model : model.name || "Unknown Model";
};

export default function GuestMyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [copiedPhone, setCopiedPhone] = useState<number | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";

  const fetchBookings = async () => {
    try {
      if (!token) return;
      const data = await getGuestBookings(token);
      setBookings(data);
    } catch (err) {
      console.error("❌ Error loading bookings", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const handleBookNow = () => navigate("/cars");
  const handleViewDetails = (carId: number) =>
    navigate(`/car-details/${carId}`);
  const handlePhoneClick = async (phone: string, bookingId: number) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhone(bookingId);
      setTimeout(() => setCopiedPhone(null), 2000);
      window.location.href = `tel:${phone}`;
    } catch {
      window.location.href = `tel:${phone}`;
    }
  };
  const handleEmailClick = (email?: string) => {
    if (email) window.location.href = `mailto:${email}`;
  };
  const handleChatClick = (host?: Booking["Car"]["host"]) => {
    if (host) alert("Chat feature coming soon!");
  };

  if (!bookings.length) {
    return (
      <>
        <Navbar />
        <div className="no-bookings-container">
          <p className="no-bookings-text">You have no bookings yet.</p>
          <button className="book-now-btn" onClick={handleBookNow}>
            Book Now
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bookings-container">
        <h2 className="bookings-title">My Bookings</h2>
        {bookings.map((booking) => {
          const car = booking.Car;
          const isCarAvailable = Boolean(car);
          const image = car?.photos?.[0]?.photo_url || "/default-car.png";
          const host = car?.host;

          const makeName = getMakeName(car?.make);
          const modelName = getModelName(car?.model);

          const isSelfDrive = booking.booking_type === "SELF_DRIVE";
          const isIntercity = booking.booking_type === "INTERCITY";
          const sdb = booking.SelfDriveBooking;
          const icb = booking.IntercityBooking;

          return (
            <div key={booking.id} className="booking-card">
              <img
                src={image}
                alt={`${makeName} ${modelName}`}
                className="booking-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/default-car.png";
                }}
              />
              <div className="booking-details">
                <div>
                  <h3>
                    {isCarAvailable
                      ? `${makeName} ${modelName} (${car?.year || "N/A"})`
                      : "Car no longer available"}
                  </h3>
                  {isCarAvailable && (
                    <p className="car-description">
                      {car?.description || "No description"}
                    </p>
                  )}

                  {/* SELF DRIVE */}
                  {isSelfDrive && sdb && (
                    <div className="booking-dates">
                      <div>
                        <p className="label">Pickup</p>
                        <p>
                          {sdb.pickup_address || "-"}
                          <br />
                          {toIST(sdb.start_datetime).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="label">Drop-off</p>
                        <p>
                          {sdb.drop_address || "-"}
                          <br />
                          {toIST(sdb.end_datetime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* INTERCITY */}
                  {isIntercity && icb && (
                    <div className="booking-dates">
                      <div>
                        <p className="label">Pickup Station</p>
                        <p>{icb.pickup_address || "-"}</p>
                      </div>
                      <div>
                        <p className="label">Drop Location</p>
                        <p>{icb.drop_address || "-"}</p>
                      </div>
                      <div>
                        <p className="label">Distance</p>
                        <p>{icb.distance_km} km</p>
                      </div>
                      <div>
                        <p className="label">Passengers</p>
                        <p>
                          PAX: {icb.pax || "-"} | Luggage: {icb.luggage || "-"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="host-info">
                    <p className="label">Host:</p>
                    <p>
                      {host ? `${host.first_name} ${host.last_name}` : "N/A"}
                    </p>
                    {host && (
                      <div className="contact-icons">
                        <button
                          className="contact-icon-btn phone-btn"
                          onClick={() =>
                            handlePhoneClick(host.phone, booking.id)
                          }
                        >
                          <span>
                            {copiedPhone === booking.id ? "Copied!" : "Call"}
                          </span>
                        </button>
                        <button
                          className="contact-icon-btn chat-btn"
                          onClick={() => handleChatClick(host)}
                        >
                          <span>Chat</span>
                        </button>
                        <button
                          className="contact-icon-btn email-btn"
                          onClick={() => handleEmailClick(host.email)}
                        >
                          <span>Email</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* PRICE SECTION WITH OTP ON TOP */}
                <div className="price-section">
                  {/* ✅ OTP COMPONENT - Shows above total for SELF_DRIVE bookings */}
                  {isSelfDrive && sdb && (
                    <PickupOTP
                      bookingId={booking.id}
                      pickupDateTime={sdb.start_datetime}
                      bookingStatus={booking.status}
                      onOtpVerified={fetchBookings}
                    />
                  )}
                  {isIntercity && icb && (
                    <PickupOTP
                      bookingId={booking.id}
                      pickupDateTime={booking.createdAt} // Using createdAt as placeholder
                      bookingStatus={booking.status}
                      onOtpVerified={fetchBookings}
                    />
                  )}

                  {/* TOTAL AMOUNT */}
                  <div className="total-breakdown">
                    <div className="total-row">
                      <strong>
                        Total: ₹{booking.total_amount.toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  {/* STATUS */}
                  <p className="status-row">
                    Status: <strong>{booking.status}</strong>
                  </p>

                  {/* VIEW DETAILS BUTTON */}
                  <button
                    className="view-details-btn"
                    onClick={() => handleViewDetails(car?.id || 0)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
