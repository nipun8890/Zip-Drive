import React, { useState, useMemo, useEffect } from "react";
import "./ChargesCard.css";

interface IntercityChargesCardProps {
  pickupStation: {
    address: string;
    lat: number;
    lng: number;
    city: string;
  };

  pickupCity: string;
  dropAddress: string;
  dropCity: string;
  tripKm: number;
  pricePerKm: number;
  insureTrip: boolean;
  insurancePerKm?: number;
  pax: number;
  luggage: number;
  onPriceChange: (pricing: {
    baseFare: number;
    driverFee: number;
    gst: number;
    total: number;
  }) => void;
  onPay: () => Promise<void>;
}

const GST_RATE = 0.18;

const IntercityChargesCard: React.FC<IntercityChargesCardProps> = ({
  pickupStation,
  dropAddress,
  dropCity,
  tripKm,
  pricePerKm,
  insureTrip,
  pax,
  luggage,
  insurancePerKm = 1.5,
  onPriceChange,
  onPay,
}) => {
  const [isAgreed, setIsAgreed] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const handlePayNow = async () => {
    if (!isAgreed || isPaying || isBooked) return;

    setIsPaying(true);

    try {
      await onPay(); // 🔥 API call
      setIsBooked(true); // ✅ permanently disable
    } catch (e) {
      console.error("Intercity booking failed", e);
      setIsPaying(false); // ❌ re-enable on error
    }
  };

  const pricing = useMemo(() => {
    const baseFare = Math.round(tripKm * pricePerKm);
    const insurance = insureTrip ? Math.round(tripKm * insurancePerKm) : 0;

    const subTotal = baseFare + insurance;
    const gst = Math.round(subTotal * GST_RATE);

    return {
      baseFare,
      insurance,
      gst,
      total: subTotal + gst, // GST INCLUDED
    };
  }, [tripKm, pricePerKm, insureTrip, insurancePerKm]);

  useEffect(() => {
    const baseFare = Math.round(tripKm * pricePerKm);
    const driverFee = Math.round(tripKm * 3);
    const gst = Math.round((baseFare + driverFee) * GST_RATE);
    const total = baseFare + driverFee + gst;

    onPriceChange({ baseFare, driverFee, gst, total });
  }, [tripKm, pricePerKm]);

  return (
    <div className="booking-container">
      {/* CHECK DETAILS */}
      <div className="check-details">
        <h3>Trip Details</h3>

        <div className="detail-item">
          <span className="icon">📍</span>
          <span>
            <strong>Pickup Station:</strong> {pickupStation.address},{" "}
            {pickupStation.city}
          </span>
        </div>

        <div className="detail-item">
          <span className="icon">🏁</span>
          <span>
            <strong>Drop Location:</strong> {dropAddress}, {dropCity}
          </span>
        </div>

        <div className="detail-item">
          <span className="icon">🛣️</span>
          <span>
            <strong>Trip Distance:</strong> {tripKm} km
          </span>
        </div>
        <div className="detail-item">
          <span className="icon">👥</span>
          <span>
            <strong>Passengers:</strong> {pax}
          </span>
        </div>

        <div className="detail-item">
          <span className="icon">🧳</span>
          <span>
            <strong>Luggage:</strong> {luggage}
          </span>
        </div>

        <div className="detail-item">
          <span className="icon">🤝</span>
          <span>Driver included • GST applicable</span>
        </div>
      </div>

      {/* CHARGES */}
      <div className="charges-card">
        <h3>Fare Breakdown</h3>

        <div className="charge-item">
          <span>Base Fare ({pricePerKm}/km)</span>
          <span>₹ {pricing.baseFare}</span>
        </div>

        <div className="charge-item">
          <span>Insurance</span>
          <span>₹ {pricing.insurance}</span>
        </div>

        <div className="charge-item">
          <span>GST (18%)</span>
          <span>₹ {pricing.gst}</span>
        </div>

        <div className="charge-total">
          <span>Total Payable</span>
          <span>₹ {pricing.total}</span>
        </div>

        <div
          style={{
            marginTop: 15,
            background: "#ebfaeb",
            color: "#277919",
            padding: 10,
            borderRadius: 6,
            fontWeight: 500,
          }}
        >
          GST included in total • Pay at pickup
        </div>

        {/* AGREEMENT */}
        <div className="terms-agree">
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
          />
          <label>
            I agree to{" "}
            <a
              href="https://www.zipdrive.in/tnc-guest.html"
              target="_blank"
              rel="noreferrer"
            >
              terms & conditions
            </a>
          </label>
        </div>

        <button
          className="pay-btn"
          disabled={!isAgreed || isPaying || isBooked}
          onClick={handlePayNow}
          style={{
            opacity: !isAgreed || isPaying || isBooked ? 0.6 : 1,
            cursor:
              !isAgreed || isPaying || isBooked ? "not-allowed" : "pointer",
            transition: "opacity 0.2s",
          }}
        >
          {isPaying
            ? "Processing..."
            : isBooked
              ? "Booking Confirmed"
              : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
};

export default IntercityChargesCard;
