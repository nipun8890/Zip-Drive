import { useState, useMemo } from "react";
import AdminNavBar from "../../../components/AdminNavbar/AdminNavbar";
import "./managePayments.css";

interface Payment {
  id: string; // Payment ID
  bookingId: string; // Booking No
  guest: string;
  host: string;
  car: string;
  driver: string;
  insurance: boolean;
  service: string;
  gst: number;
  totalAmount: number;
  paymentMethod: "Credit Card" | "PayPal" | "Bank Transfer" | "Cash";
  date: string;
  status: "Completed" | "Pending" | "Failed" | "Refunded";
  action?: string;
  ratings: number;
}

const paymentData: Payment[] = [
  {
    id: "PAY2023001",
    bookingId: "BK2023001",
    guest: "Ethan Carter",
    host: "Olivia Bennett",
    car: "Tesla Model S",
    driver: "Self",
    insurance: true,
    service: "Premium",
    gst: 15.0,
    totalAmount: 165.0,
    paymentMethod: "Credit Card",
    date: "2023-01-15",
    status: "Completed",
    action: "",
    ratings: 4.5,
  },
  {
    id: "PAY2023002",
    bookingId: "BK2023002",
    guest: "Sophia Clark",
    host: "Noah Davis",
    car: "BMW X5",
    driver: "Chauffeur",
    insurance: false,
    service: "Standard",
    gst: 12.0,
    totalAmount: 212.0,
    paymentMethod: "PayPal",
    date: "2023-01-20",
    status: "Completed",
    action: "",
    ratings: 5,
  },
  // Add other entries similarly...
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const years = ["2023", "2024", "2025"];

export default function PaymentManagement() {
  const [selectedMonth, setSelectedMonth] = useState("March");
  const [selectedYear, setSelectedYear] = useState("2023");
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("All Methods");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filteredPayments = useMemo(() => {
    return paymentData.filter((payment) => {
      const paymentDate = new Date(payment.date);
      const paymentMonth = months[paymentDate.getMonth()];
      const paymentYear = paymentDate.getFullYear().toString();

      const matchesDate =
        (selectedMonth === "All Months" || paymentMonth === selectedMonth) &&
        (selectedYear === "All Years" || paymentYear === selectedYear);

      const matchesSearch =
        payment.id.toLowerCase().includes(search.toLowerCase()) ||
        payment.bookingId.toLowerCase().includes(search.toLowerCase()) ||
        payment.paymentMethod.toLowerCase().includes(search.toLowerCase()) ||
        payment.guest.toLowerCase().includes(search.toLowerCase()) ||
        payment.host.toLowerCase().includes(search.toLowerCase()) ||
        payment.car.toLowerCase().includes(search.toLowerCase()) ||
        payment.driver.toLowerCase().includes(search.toLowerCase()) ||
        payment.service.toLowerCase().includes(search.toLowerCase());

      const matchesMethod =
        methodFilter === "All Methods" ||
        payment.paymentMethod === methodFilter;
      const matchesStatus =
        statusFilter === "All Status" || payment.status === statusFilter;

      return matchesDate && matchesSearch && matchesMethod && matchesStatus;
    });
  }, [selectedMonth, selectedYear, search, methodFilter, statusFilter]);

  const paginatedPayments = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, page]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize);

  const uniqueMethods = [
    "All Methods",
    ...Array.from(new Set(paymentData.map((payment) => payment.paymentMethod))),
  ];
  const uniqueStatuses = [
    "All Status",
    ...Array.from(new Set(paymentData.map((payment) => payment.status))),
  ];

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Completed":
        return "status-completed";
      case "Pending":
        return "status-pending";
      case "Failed":
        return "status-failed";
      case "Refunded":
        return "status-refunded";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return "✅";
      case "Pending":
        return "⏳";
      case "Failed":
        return "❌";
      case "Refunded":
        return "↩️";
      default:
        return "●";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "Credit Card":
        return "💳";
      case "PayPal":
        return "🟦";
      case "Bank Transfer":
        return "🏦";
      case "Cash":
        return "💰";
      default:
        return "💳";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const totalAmount = filteredPayments.reduce(
    (sum, payment) => sum + payment.totalAmount,
    0
  );

  return (
    <>
      <AdminNavBar />
      <div className="payment-management">
        <h1 className="title">Payment Management</h1>

        <div className="card">
          <div className="header-section">
            <h2 className="page-title">Payments</h2>
            <div className="date-filters">
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setPage(1);
                }}
                className="date-filter"
              >
                <option value="All Months">All Months</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setPage(1);
                }}
                className="date-filter"
              >
                <option value="All Years">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="summary-section">
            <div className="total-amount">Total: ${totalAmount.toFixed(2)}</div>
            <div className="payment-count">
              {filteredPayments.length} payment
              {filteredPayments.length !== 1 ? "s" : ""} found
            </div>
          </div>

          <div className="toolbar">
            <input
              type="text"
              placeholder="🔍 Search payments by any field..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search"
            />

            <div className="filters">
              <select
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value);
                  setPage(1);
                }}
                className="filter-select"
              >
                {uniqueMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="filter-select"
              >
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Booking No</th>
                <th>Guest</th>
                <th>Host</th>
                <th>Car</th>
                <th>Driver</th>
                <th>Insurance</th>
                <th>Service</th>
                <th>GST</th>
                <th>Total Amount</th>
                <th>Payment Method</th>
                <th>Date</th>
                <th>Status</th>
                <th>Ratings</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment, index) => (
                  <tr
                    key={payment.id}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td data-label="Payment ID">{payment.id}</td>
                    <td data-label="Booking No">{payment.bookingId}</td>
                    <td data-label="Guest">{payment.guest}</td>
                    <td data-label="Host">{payment.host}</td>
                    <td data-label="Car">{payment.car}</td>
                    <td data-label="Driver">{payment.driver}</td>
                    <td data-label="Insurance">
                      {payment.insurance ? "Yes" : "No"}
                    </td>
                    <td data-label="Service">{payment.service}</td>
                    <td data-label="GST">{payment.gst.toFixed(2)}</td>
                    <td data-label="Total Amount">
                      {payment.totalAmount.toFixed(2)}
                    </td>
                    <td data-label="Payment Method">
                      {getMethodIcon(payment.paymentMethod)}{" "}
                      {payment.paymentMethod}
                    </td>
                    <td data-label="Date">{formatDate(payment.date)}</td>
                    <td data-label="Status">
                      <span
                        className={`status ${getStatusClass(payment.status)}`}
                      >
                        {getStatusIcon(payment.status)} {payment.status}
                      </span>
                    </td>
                    <td data-label="Ratings">{payment.ratings.toFixed(1)}</td>
                    <td data-label="Action">{payment.action || ""}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={15}>
                    <div className="empty">
                      <h3>No payments found</h3>
                      <p>Try adjusting your search criteria or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination">
            <div className="pagination-text">
              <span className="results-count">
                {filteredPayments.length} payment
                {filteredPayments.length !== 1 ? "s" : ""} found
              </span>
              <span className="page-number">
                Page {page} of {totalPages || 1}
              </span>
            </div>

            <div className="pagination-btns">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                ← Previous
              </button>
              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
