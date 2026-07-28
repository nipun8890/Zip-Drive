import "./Footer.css";
import {
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left: Logo + About */}
        <div className="footer-col">
          <h2 className="footer-logo">
            ZIP<span>DRIVE</span>
          </h2>
          <p>
            Zipdrive – Home to Self Driven Cars in India. For your cosy,
            reliable and fearless mobility needs.
          </p>
          <div className="footer-socials">
            <a href="https://www.x.com/">
              <FaTwitter />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61581919191896">
              <FaFacebookF />
            </a>
            <a href="#">
              <FaInstagram />
            </a>
          </div>
        </div>

        {/* Information Links */}
        <div className="footer-col">
          <h4>Information</h4>
          <ul>
            <li>
              <a href="#">About</a>
            </li>
            <li>
              <a href="#">Services</a>
            </li>
            <li>
              <a href="#">Term and Conditions</a>
            </li>
            <li>
              <a href="#">Best Price Guarantee</a>
            </li>
            <li>
              <a href="#">Privacy & Cookies Policy</a>
            </li>
          </ul>
        </div>

        {/* Customer Support */}
        <div className="footer-col">
          <h4>Customer Support</h4>
          <ul>
            <li>
              <a href="#">FAQ</a>
            </li>
            <li>
              <a href="#">Payment Option</a>
            </li>
            <li>
              <a href="#">Booking Tips</a>
            </li>
            <li>
              <a href="#">How it works</a>
            </li>
            <li>
              <a href="#">Contact Us</a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-col">
          <h4>Have a Questions?</h4>
          <p>
            <FaMapMarkerAlt /> I-thum Business Park, Sector 62, Noida 201 301
            India
          </p>
          <p>
            <FaPhone /> +91 9837 3354
          </p>
          <p>
            <FaEnvelope /> support@zipdrive.in
          </p>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="footer-bottom">
        <p>Copyright ©2025 All rights reserved.</p>
      </div>
    </footer>
  );
}
