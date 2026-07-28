import { useEffect, useState } from "react";
import { toIST } from "../../utils/time";
import "./DropOTP.css";

const API_URL = `${import.meta.env.VITE_API_URL}/booking-otp`;

interface DropOTPProps {
  bookingId: number;
  dropDateTime: string;
  bookingStatus: string;
  onOtpVerified?: () => void;
}

export default function DropOTP({
  bookingId,
  dropDateTime,
  bookingStatus,
  onOtpVerified,
}: DropOTPProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeUntilVisible, setTimeUntilVisible] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /* ---------------- OTP VISIBILITY LOGIC ---------------- */
  const checkOTPVisibility = () => {
    const now = new Date();
    const drop = toIST(dropDateTime);

    // OTP becomes visible at or after the drop time
    const shouldBeVisible = now >= drop;
    setIsVisible(shouldBeVisible);

    if (!shouldBeVisible && now < drop) {
      const diff = drop.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeUntilVisible(`${hours}h ${minutes}m`);
      } else {
        setTimeUntilVisible(`${minutes} mins`);
      }
    }
  };

  useEffect(() => {
    checkOTPVisibility();
    const interval = setInterval(checkOTPVisibility, 60000);
    return () => clearInterval(interval);
  }, [dropDateTime]);

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
          otp_type: "DROP",
          otp_code: enteredOtp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      setSuccess(true);
      if (onOtpVerified) {
        onOtpVerified();
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- RENDER CONDITIONS ---------------- */

  // Only show for ACTIVE or CONFIRMED bookings
  if (bookingStatus !== "ACTIVE" && bookingStatus !== "CONFIRMED") return null;

  if (!isVisible) {
    return (
      <div className="drop-otp-container">
        <div className="drop-otp-inactive">
          <div className="drop-otp-icon">🔒</div>
          <p className="drop-otp-label">DROP OTP</p>
          <p className="drop-otp-countdown">
            Available in <strong>{timeUntilVisible}</strong>
          </p>
          <p className="drop-otp-info">OTP will be enabled at drop-off time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="drop-otp-container">
      <div className="drop-otp-active">
        <p className="drop-otp-label">ENTER DROP OTP</p>
        <p className="drop-otp-instruction">Verify car return from guest</p>

        {success ? (
          <p className="drop-otp-success">✅ Car Returned. Booking Completed</p>
        ) : (
          <>
            <input
              type="text"
              className="drop-otp-input"
              maxLength={6}
              placeholder="Enter 6 digit OTP"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
            />

            {error && <p className="drop-otp-error">{error}</p>}

            <button
              className="drop-verify-btn"
              onClick={verifyOtp}
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify Drop OTP"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
