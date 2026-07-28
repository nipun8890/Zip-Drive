import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";

import logo from "../../assets/logo.png";
import defaultAvatar from "../../assets/user.png";
import "./Navbar.css";
import Login from "../../pages/auth/Login/Login";
import Register from "../../pages/auth/Register/Register";
import ModalWrapper from "../ModalWrapper/ModalWrapper";
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCar,
  faCalendarAlt,
  faLifeRing,
  faDoorOpen,
  faPlus,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import type { User } from "../../types/user";
import { fetchUserProfile } from "../../services/auth";

interface TokenPayload {
  role: "host" | "guest" | "admin";
}

interface NavbarProps {
  profilePicUrl?: string | null;
}

export default function Navbar({
  profilePicUrl: propProfilePicUrl,
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"host" | "guest" | "admin" | null>(null);
  const [activeModal, setActiveModal] = useState<"login" | "register" | null>(
    null,
  );
  const [remark, setRemark] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(
    propProfilePicUrl ?? null,
  );

  const hamburgerRef = useRef<HTMLDivElement | null>(null);
  const navMenuRef = useRef<HTMLUListElement | null>(null);

  // ── NAV ITEMS ────────────────────────────────────────────────
  const publicNavItems = [
    { label: "Home", path: "/" },
    { label: "SelfDrive", path: "/searched-cars" },
    { label: "Intercity", path: "/intercity-cars" },
    { label: "Community", path: "/community" },
  ];

  const hostNavItems = [
    { label: "Home", path: "/" },
    { label: "Add a Car", path: "/add-car", icon: faPlus },
    { label: "My Cars", path: "/my-cars", icon: faCar },
    { label: "My Bookings", path: "/host-mybookings", icon: faCalendarAlt },
    { label: "Support", path: "/support", icon: faLifeRing },
  ];

  const guestNavItems = [
    { label: "Home", path: "/" },
    { label: "Book a Car", path: "/searched-cars", icon: faCar },
    { label: "My Bookings", path: "/guest-mybookings", icon: faCalendarAlt },
    { label: "Support", path: "/support", icon: faLifeRing },
  ];

  // ── CLOSE MOBILE MENU ON OUTSIDE CLICK ───────────────────────
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target as Node) &&
        navMenuRef.current &&
        !navMenuRef.current.contains(event.target as Node)
      ) {
        setNavOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── LOAD USER FROM LOCALSTORAGE ON MOUNT ─────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }

    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setRole(decoded.role);
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, []);

  // ── FETCH FRESH PROFILE IF TOKEN EXISTS ──────────────────────
  useEffect(() => {
    const loadUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const profile = await fetchUserProfile(token);
        setUser(profile);
        if (profile.profile_pic) {
          setProfilePicUrl(profile.profile_pic);
        }
        const decoded = jwtDecode<TokenPayload>(token);
        setRole(decoded.role);
      } catch (err) {
        console.error("Failed to load user profile", err);
      }
    };

    loadUserProfile();
  }, []);

  // ── AUTO-OPEN LOGIN MODAL WHEN NAVIGATED WITH openLogin: true ─
  useEffect(() => {
    if (location.state?.openLogin === true) {
      setActiveModal("login");

      // Clean up the state so refreshing or remount doesn't re-open
      navigate(location.pathname, {
        replace: true,
        state: {
          ...location.state,
          openLogin: undefined,
        },
      });
    }
  }, [location.state, navigate, location.pathname]);

  // ── ACTIONS ──────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setRole(null);
    setNavOpen(false);
    navigate("/");
  };

  const handleUserLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setRole(decoded.role);
      } catch (err) {
        console.error("Invalid token after login", err);
      }
    }

    setRemark("");
    setActiveModal(null);

    // If user was trying to book a car → redirect after login
    if (location.state?.intendedCarId) {
      navigate("/selfdrive/car", {
        state: {
          carId: location.state.intendedCarId,
          bookingDetails: location.state.intendedBookingDetails,
          pickupLocation: location.state.intendedPickupLocation,
        },
      });
    }
  };

  const openLogin = () => setActiveModal("login");

  // ── JSX ──────────────────────────────────────────────────────
  return (
    <>
      <nav className="scroll-navbar">
        <div className="scroll-navbar-logo">
          <img src={logo} alt="Logo" />
        </div>

        {/* Hamburger */}
        <div
          className="scroll-navbar-hamburger"
          onClick={() => setNavOpen((prev) => !prev)}
          ref={hamburgerRef}
          role="button"
          tabIndex={0}
        >
          <FontAwesomeIcon icon={navOpen ? faDoorOpen : faBars} size="lg" />
        </div>

        {/* NAV LINKS */}
        <ul
          className={`scroll-navbar-links${navOpen ? " active" : ""}`}
          ref={navMenuRef}
        >
          {/* Public (not logged in) */}
          {!user &&
            publicNavItems.map((item) => (
              <li key={item.label}>
                <NavLink to={item.path} onClick={() => setNavOpen(false)}>
                  {item.label}
                </NavLink>
              </li>
            ))}

          {/* Host */}
          {role === "host" &&
            hostNavItems.map((item) => (
              <li key={item.label}>
                <NavLink to={item.path} onClick={() => setNavOpen(false)}>
                  {item.label}
                </NavLink>
              </li>
            ))}

          {/* Guest */}
          {role === "guest" &&
            guestNavItems.map((item) => (
              <li key={item.label}>
                <NavLink to={item.path} onClick={() => setNavOpen(false)}>
                  {item.label}
                </NavLink>
              </li>
            ))}

          {/* Logged in user */}
          {user && (
            <>
              <li>
                <NavLink to="/my-documents" onClick={() => setNavOpen(false)}>
                  Profile
                </NavLink>
              </li>
              <li>
                <NavLink to="/" onClick={handleLogout}>
                  Logout
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {/* LOGIN BUTTON (only visible when not logged in) */}
        {!user && (
          <div className="scroll-navbar-login">
            <button className="btn btn-custom" onClick={openLogin}>
              Login
            </button>
          </div>
        )}

        {/* Profile avatar (visual only) */}
        {user && (
          <img
            src={profilePicUrl || user.avatar || defaultAvatar}
            className="profile-avatar"
            alt="User avatar"
          />
        )}
      </nav>

      {/* AUTH MODAL */}
      {activeModal && (
        <ModalWrapper onClose={() => setActiveModal(null)}>
          {activeModal === "login" ? (
            <Login
              onClose={() => setActiveModal(null)}
              onSwitch={() => setActiveModal("register")}
              onLoginSuccess={handleUserLogin}
              remark={remark}
            />
          ) : (
            <Register
              onClose={() => setActiveModal(null)}
              onSwitch={() => setActiveModal("login")}
              onRegisterSuccess={() => {
                setRemark("Verification sent. Complete verification to login.");
                setActiveModal("login");
              }}
            />
          )}
        </ModalWrapper>
      )}
    </>
  );
}
