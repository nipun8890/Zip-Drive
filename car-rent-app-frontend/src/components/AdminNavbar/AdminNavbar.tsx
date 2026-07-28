import { useState, useRef, useEffect } from "react";
import logo from "../../assets/logo.png";
import userIcon from "../../assets/user.png";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ import useLocation
import "./AdminNavbar.css";

const adminMenu = [
  { name: "Dashboard", path: "/admin/dashboard" },
  { name: "Cars", path: "/admin/manage-cars" },
  { name: "Guests", path: "/admin/manage-guests" },
  { name: "Host", path: "/admin/manage-hosts" },
  { name: "Bookings", path: "/admin/manage-bookings" },
  { name: "Payments", path: "/admin/manage-payments" },
  { name: "Support", path: "/admin/manage-support" },
];

export default function AdminNavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation(); // ✅ track current path

  // Close profile menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMenuOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <nav className="zipd-nav-container_9214">
      {/* Brand Section */}
      <div className="zipd-nav-brand_9214" onClick={() => navigate("/")}>
        <img src={logo} alt="ZipDrive Admin" className="zipd-nav-logo_9214" />
      </div>

      {/* Desktop Links */}
      <ul className="zipd-nav-links_9214">
        {adminMenu.map((item) => (
          <li
            key={item.name}
            className={`zipd-nav-linkitem_9214 ${
              location.pathname === item.path ? "active" : ""
            }`} // ✅ add active class
            onClick={() => navigate(item.path)}
          >
            {item.name}
          </li>
        ))}
      </ul>

      {/* User Section */}
      <div className="zipd-nav-user_9214" ref={profileMenuRef}>
        <img
          src={userIcon}
          alt="User"
          className="zipd-nav-avatar_9214"
          onClick={() => setMenuOpen((prev) => !prev)}
        />
        {menuOpen && (
          <div className="zipd-nav-profilemenu_9214">
            <div className="zipd-nav-profileitem_9214" onClick={handleLogout}>
              Logout
            </div>
          </div>
        )}
      </div>

      {/* Hamburger Button (Mobile) */}
      <div
        className={`zipd-nav-hamburger_9214 ${mobileOpen ? "active" : ""}`}
        onClick={() => setMobileOpen((prev) => !prev)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="zipd-nav-mobilemenu_9214">
          {adminMenu.map((item) => (
            <div
              key={item.name}
              className={`zipd-nav-mobileitem_9214 ${
                location.pathname === item.path ? "active" : ""
              }`} // ✅ highlight in mobile too
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              {item.name}
            </div>
          ))}
          <div className="zipd-nav-mobileitem_9214" onClick={handleLogout}>
            Logout
          </div>
        </div>
      )}
    </nav>
  );
}
