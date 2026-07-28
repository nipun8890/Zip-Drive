import AdminNavBar from "../../../components/AdminNavbar/AdminNavbar";
import "./dashboard.css";

export default function Dashboard() {
  return (
    <>
      <AdminNavBar />

      <div className="dashboard-container">
        <h1 className="dashboard-title">
          <span className="dashboard-icon">📊</span> Dashboard
        </h1>

        <div className="dashboard-card">
          <div className="dashboard-logo">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6b7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>

          <h2 className="dashboard-heading">Dashboard Under Development</h2>

          <p className="dashboard-text">
            This page is currently under development. Our team is working to
            deliver comprehensive analytics and reporting features.
          </p>

          <div className="dashboard-info"></div>
        </div>
      </div>
    </>
  );
}
