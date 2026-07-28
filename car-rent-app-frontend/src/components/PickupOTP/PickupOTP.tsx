import { useEffect, useState } from "react";
import { toIST } from "../../utils/time";
import "./PickupOTP.css";

const API_URL = `${import.meta.env.VITE_API_URL}/booking-otp`;

interface PickupOTPProps {
  bookingId: number;
  pickupDateTime: string;
  bookingStatus: string;
  onOtpVerified?: () => void;
}

export default function PickupOTP({
  bookingId,
  pickupDateTime,
  bookingStatus,
  onOtpVerified,
}: PickupOTPProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeUntilVisible, setTimeUntilVisible] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /* ---------------- OTP VISIBILITY LOGIC ---------------- */
  const checkOTPVisibility = () => {
    const now = new Date();
    const pickup = toIST(pickupDateTime);
    const thirtyMinsBefore = new Date(pickup.getTime() - 30 * 60 * 1000);

    const shouldBeVisible = now >= thirtyMinsBefore && now < pickup;
    setIsVisible(shouldBeVisible);

    if (!shouldBeVisible && now < thirtyMinsBefore) {
      const diff = thirtyMinsBefore.getTime() - now.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      setTimeUntilVisible(`${minutes} mins`);
    } else if (now >= pickup) {
      setTimeUntilVisible("Pickup time passed");
    }
  };

  useEffect(() => {
    checkOTPVisibility();
    const interval = setInterval(checkOTPVisibility, 60000);
    return () => clearInterval(interval);
  }, [pickupDateTime]);

  /* ---------------- VERIFY OTP ---------------- */
  const verifyOtp = async () => {
    if (enteredOtp.length !== 6) {
      setError("Enter valid 6 digit OTP");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_id: bookingId,
          otp_type: "PICKUP",
          otp_code: enteredOtp,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onOtpVerified;
      }
      if (!res.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- RENDER CONDITIONS ---------------- */

  if (bookingStatus !== "CONFIRMED") return null;

  if (!isVisible) {
    return (
      <div className="pickup-otp-container">
        <div className="otp-inactive">
          <div className="otp-icon">🔒</div>
          <p className="otp-label">PICKUP OTP</p>
          <p className="otp-countdown">
            Available in <strong>{timeUntilVisible}</strong>
          </p>
          <p className="otp-info">OTP will be enabled 30 mins before pickup</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pickup-otp-container">
      <div className="otp-active">
        <p className="otp-label">ENTER PICKUP OTP</p>

        {success ? (
          <p className="otp-success">✅ OTP Verified. Booking Activated</p>
        ) : (
          <>
            <input
              type="text"
              className="otp-input"
              maxLength={6}
              placeholder="Enter 6 digit OTP"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
            />

            {error && <p className="otp-error">{error}</p>}

            <button
              className="verify-btn"
              onClick={verifyOtp}
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
