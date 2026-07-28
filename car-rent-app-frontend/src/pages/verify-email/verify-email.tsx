import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    // Call backend API to verify email
    fetch(`${import.meta.env.VITE_API_URL}/users/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
          // ✅ Auto redirect after 3 seconds to home with login popup
          setTimeout(() => navigate("/?showLogin=true"), 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Email verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [location, navigate]);

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 500,
        margin: "50px auto",
        textAlign: "center",
        border: "1px solid #ccc",
        borderRadius: 8,
      }}
    >
      {status === "loading" && <p>Verifying your email...</p>}
      {(status === "success" || status === "error") && (
        <>
          <p>{message}</p>
          <button
            onClick={() => navigate("/?showLogin=true")}
            style={{
              marginTop: 20,
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            Go to Login
          </button>
        </>
      )}
    </div>
  );
}

export default VerifyEmail;
