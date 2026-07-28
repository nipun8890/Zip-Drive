import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import {
  sendSupportMessage,
  type SupportFormData,
} from "../../services/support";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";
import "./support.css";

// Fix Leaflet marker icon issue
const DefaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function Support() {
  const [form, setForm] = useState<SupportFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const fixedPosition = { lat: 28.557016, lng: 77.32624 };

  const [location, setLocation] = useState({
    city: "",
    state: "",
    country: "",
    lat: fixedPosition.lat,
    lng: fixedPosition.lng,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_TOKEN;

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const res = await fetch(
          `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_KEY}&lat=${fixedPosition.lat}&lon=${fixedPosition.lng}&format=json`
        );
        const data = await res.json();

        const addr = {
          city:
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.hamlet ||
            "",
          state: data.address.state || "",
          country: data.address.country || "",
          lat: fixedPosition.lat,
          lng: fixedPosition.lng,
        };
        setLocation(addr);
      } catch {
        setLocation({
          city: "",
          state: "",
          country: "",
          lat: fixedPosition.lat,
          lng: fixedPosition.lng,
        });
      }
    };
    fetchAddress();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const locationDetails =
        location.city || location.state || location.country
          ? `\n\nLocation:\nCity: ${location.city}\nState: ${location.state}\nCountry: ${location.country}`
          : "";

      const response = await sendSupportMessage({
        ...form,
        message: form.message + locationDetails,
      });
      setSuccessMsg(response.message);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="support-page">
        <div className="support-grid">
          {/* Left Info Cards */}
          <div className="support-info-cards">
            <div className="support-card">
              <div className="support-card-title">Address</div>
              <div className="support-card-value">
                I-Thum Business Park Sector 62
                <br />
                Noida India 201301
              </div>
            </div>
            <div className="support-card">
              <div className="support-card-title">Phone</div>
              <div className="support-card-value">+91 9837 3354</div>
            </div>
            <div className="support-card">
              <div className="support-card-title">Email</div>
              <div className="support-card-value">support@zipdrive.in</div>
            </div>
          </div>

          {/* Contact Form */}
          <form className="support-form" onSubmit={handleSubmit}>
            <h2>Contact Support</h2>

            {successMsg && <p className="success-msg">{successMsg}</p>}
            {error && <p className="error-msg">{error}</p>}

            <div className="input-grid">
              <input
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                required
                className="input"
                disabled={loading}
              />
              <input
                name="email"
                type="email"
                placeholder="Your Email"
                value={form.email}
                onChange={handleChange}
                required
                className="input"
                disabled={loading}
              />
              <input
                name="subject"
                placeholder="Subject"
                value={form.subject}
                onChange={handleChange}
                required
                className="input"
                disabled={loading}
              />
              <textarea
                name="message"
                placeholder="Message"
                value={form.message}
                onChange={handleChange}
                required
                className="textarea"
                rows={4}
                disabled={loading}
              />
              <button type="submit" className="support-btn" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </div>

        {/* Map as a separate block below */}
        <div className="support-map-container">
          <MapContainer
            center={fixedPosition}
            zoom={13}
            style={{ height: "600px", width: "100%" }}
            dragging={true}
            zoomControl={true}
            doubleClickZoom={true}
            scrollWheelZoom={true}
            keyboard={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <Marker position={fixedPosition} />
          </MapContainer>

          {location.city && (
            <p className="selected-location">
              <strong>Selected Location:</strong> {location.city},{" "}
              {location.state}, {location.country}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
