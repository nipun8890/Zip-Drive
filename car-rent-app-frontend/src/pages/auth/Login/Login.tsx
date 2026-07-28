import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../../services/auth";
import { jwtDecode } from "jwt-decode";
import "./Login.css";
import type { User } from "../../../types/user";

interface LoginProps {
  onClose: () => void;
  onSwitch: () => void;
  onLoginSuccess: (userData: User) => void;
  remark?: string; // <--- prop to show verification message
}

interface JwtPayload {
  id: number;
  email: string;
  role: "admin" | "host" | "guest";
  iat: number;
  exp: number;
}

export default function Login({
  onClose,
  onSwitch,
  onLoginSuccess,
  remark,
}: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await loginUser({ email, password });
      const token = res.token;
      if (!token) throw new Error("No token returned from server");
      localStorage.setItem("token", token);

      const decoded: JwtPayload = jwtDecode(token);
      const userData: User = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        token,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      onLoginSuccess(userData);

      if (decoded.role === "admin") {
        navigate("/admin/manage-cars");
      } else if (decoded.role === "host") {
        navigate("/my-cars");
      } else if (decoded.role === "guest") {
        navigate("/searched-cars");
      }

      onClose();
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || err.message || "Login failed");
    }
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div
        className="login-dialog card shadow-lg border-0 rounded-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="btn-close position-absolute top-0 end-0 m-3"
        />
        <div className="row g-0">
          {/* Left side: Form */}
          <div className="col-md-6 p-4 d-flex flex-column justify-content-center">
            <h2 className="fw-bold mb-2">Welcome back</h2>
            <p className="text-muted mb-4 small">
              Please enter your details to sign in.
            </p>

            {/* Show verification remark if present */}
            {remark && (
              <div className="alert alert-info w-100 mb-3 small">{remark}</div>
            )}

            <form className="d-flex flex-column gap-3" onSubmit={handleLogin}>
              <div>
                <label
                  htmlFor="email"
                  className="form-label small text-uppercase text-secondary mb-1 fw-semibold"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="form-label small text-uppercase text-secondary mb-1 fw-semibold"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="alert alert-danger py-2 small">{error}</div>
              )}
              <button type="submit" className="btn btn-primary w-100">
                Sign in
              </button>
              <p className="text-center text-muted mt-2 mb-0 small">
                Don’t have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitch}
                  className="btn btn-link p-0 fw-semibold text-decoration-none"
                >
                  Click To Register
                </button>
              </p>
            </form>
          </div>
          {/* Right side: Image */}
          <div className="col-md-6 d-none d-md-block position-relative">
            <img
              src="https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?fit=crop&w=900&q=80"
              alt="Car background"
              className="w-100 h-100 object-fit-cover"
            />
            <div className="position-absolute bottom-0 end-0 m-3 p-2 bg-dark bg-opacity-50 text-white rounded-3 small fst-italic">
              “We've been using ZipDrive to get our trips organized and it's
              been a lifesaver.”
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
