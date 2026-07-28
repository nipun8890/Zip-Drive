import { useState, type ChangeEvent, type FormEvent } from "react";
import type { UserRegister } from "../../../types/user";
import { registerUser } from "../../../services/auth";
import "./Register.css";

interface RegisterProps {
  onSwitch: () => void;
  onRegisterSuccess: () => void;
  onClose?: () => void;
}

export default function Register({
  onSwitch,
  onRegisterSuccess,
}: RegisterProps) {
  const [formData, setFormData] = useState<UserRegister>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    role: "guest",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const toggleRole = () => {
    setFormData((prev) => ({
      ...prev,
      role: prev.role === "guest" ? "host" : "guest",
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      onRegisterSuccess();
    } catch (err: any) {
      setErrorMessage(err?.message || "Registration failed");
    }
  };

  return (
    <div className="rm-overlay">
      <div className="rm-card">
        {/* LEFT */}
        <div className="rm-form">
          <h2 className="rm-title">Create An Account</h2>

          <div className="rm-role">
            <span>Role: {formData.role === "guest" ? "Guest" : "Host"}</span>
            <label className="rm-switch">
              <input
                type="checkbox"
                checked={formData.role === "host"}
                onChange={toggleRole}
              />
              <span className="rm-slider" />
            </label>
          </div>

          <form onSubmit={handleSubmit} className="rm-form-body">
            <div className="rm-row">
              <input
                name="first_name"
                placeholder="First name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
              <input
                name="last_name"
                placeholder="Last name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            {errorMessage && <div className="rm-error">{errorMessage}</div>}

            <input
              name="phone"
              placeholder="Phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit" className="rm-submit">
              Register
            </button>

            <p className="rm-footer">
              Already have an account?
              <button type="button" onClick={onSwitch}>
                Login
              </button>
            </p>
          </form>
        </div>

        {/* RIGHT */}
        <div className="rm-image" />
      </div>
    </div>
  );
}
