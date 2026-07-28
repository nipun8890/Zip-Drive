import React, { useState } from "react";
import "./ChargesCard.css";

interface ChargesCardProps {
  carCharges: number;
  insuranceCharges: number;
  driverCharges: number;
  pickDropCharges: number;
  gst: number;
  carLocation?: string;

  onPay?: () => Promise<void>; // ✅ optional
  disabled?: boolean;

  isEligible: boolean | null;
  eligibilityReason?: string;
}

const ChargesCard: React.FC<ChargesCardProps> = ({
  carCharges,
  insuranceCharges,
  driverCharges,
  pickDropCharges,
  gst,
  carLocation,
  onPay,
  disabled,
  isEligible,
  eligibilityReason,
}) => {
  const totalCost =
    carCharges + insuranceCharges + driverCharges + pickDropCharges + gst;
  const [isAgreed, setIsAgreed] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const handlePayNow = async () => {
    if (!isAgreed || isPaying || isBooked) return;

    setIsPaying(true);

    try {
      if (!onPay) return;
      await onPay();
      // 🔥 booking API call
      setIsBooked(true); // ✅ success → permanently disabled
    } catch (error) {
      console.error("Booking failed:", error);
      setIsPaying(false); // ❌ error → re-enable button
    }
  };

  // 🔎 Debug log
  console.log("👉 ChargesCard props:", {
    carCharges,
    insuranceCharges,
    driverCharges,
    pickDropCharges,
    gst,
    carLocation,
    totalCost,
  });

  return (
    <div className="booking-container">
      <div className="check-details">
        <h3>Check Details</h3>

        <div className="detail-item">
          <span className="icon">📍</span>
          <span>
            <strong>Car Pickup Location:</strong>{" "}
            {carLocation || "Not specified"}
          </span>
        </div>
        <div className="detail-item">
          <span className="icon">📄</span>

          {isEligible ? (
            <span style={{ color: "#22c55e", fontWeight: 600 }}>
              ✅ Your documents are verified.
            </span>
          ) : (
            <span style={{ color: "#ef4444", fontWeight: 600 }}>
              ❌ Documents not verified.
              {eligibilityReason && (
                <>
                  <br />
                  <small>Reason: {eligibilityReason}</small>
                </>
              )}
            </span>
          )}
        </div>
      </div>

      <div className="charges-card">
        <h3>Confirm Your Booking</h3>

        <div className="charge-item">
          <span>CAR CHARGES:</span> <span>INR {carCharges}</span>
        </div>
        <div className="charge-item">
          <span>INSURE CHARGES:</span> <span>INR {insuranceCharges}</span>
        </div>
        <div className="charge-item">
          <span>DRIVER CHARGES:</span> <span>INR {driverCharges}</span>
        </div>
        <div className="charge-item">
          <span>PICK & DROP CHARGES:</span> <span>INR {pickDropCharges}</span>
        </div>
        <div className="charge-item">
          <span>GST (18%):</span> <span>INR {gst}</span>
        </div>

        <div className="charge-total">
          <span>TOTAL COST:</span> <span>INR {totalCost}</span>
        </div>

        <div
          style={{
            marginTop: "15px",
            marginBottom: "10px",
            background: "#ebfaeb",
            fontWeight: 500,
            color: "#277919",
            fontSize: "1rem",
            padding: "10px",
            borderRadius: "6px",
          }}
        >
          Pay only INR 0 now and confirm your booking. Pay balance amount on car
          pickup
        </div>
        {/* Checkbox & Agreement Section */}
        <div
          className="terms-agree"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            margin: "20px 0",
          }}
        >
          <input
            type="checkbox"
            id="termsAgree"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
            style={{
              accentColor: "#22c55e", // optional: matches a green theme
              width: 20,
              height: 20,
              verticalAlign: "middle",
              cursor: "pointer",
            }}
          />
          <label
            htmlFor="termsAgree"
            style={{
              color: "#fff",
              fontSize: "12px",
              fontWeight: "400",
              cursor: "pointer",
            }}
          >
            You agree to{" "}
            <a
              href="https://www.zipdrive.in/tnc-guest.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#22c55e",
                textDecoration: "underline",
                fontWeight: 500,
              }}
            >
              terms & conditions
            </a>
            {", including the cancellation policy."}
          </label>
        </div>

        <button
          className="pay-btn"
          onClick={handlePayNow}
          disabled={
            !isAgreed || isPaying || isBooked || disabled || !isEligible
          }
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
              : !isEligible
                ? "Verify Documents First"
                : "Pay Now"}
        </button>
      </div>
    </div>
  );
};

export default ChargesCard;
