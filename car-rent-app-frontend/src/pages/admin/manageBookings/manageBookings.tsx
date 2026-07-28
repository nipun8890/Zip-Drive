import { useState, useEffect, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import AdminNavBar from "../../../components/AdminNavbar/AdminNavbar";
import {
  getAllBookingsAdmin,
  deleteBooking,
  updateBooking,
} from "../../../services/booking";

import "./manageBooking.css";

interface Booking {
  bookingId: string;
  carNo: string;
  bookedBy: string;
  pickUpLoc: string;
  pickUpType: string;
  dropOffLoc: string;
  dropOffType: string;
  startDatetime: string;
  endDatetime: string;
  driveType: string;
  insure: boolean;
  payment: string;
  status: "Active" | "Completed" | "Cancelled" | "Pending";
  ratings: number;
}

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

export default function BookingManagement() {
  const [bookingData, setBookingData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("All Status");
  const [carFilter, setCarFilter] = useState("All Cars");
  const [selectedMonth, setSelectedMonth] = useState("All Months");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const token = localStorage.getItem("token") || "";

  // State for editing booking
  const [isEditing, setIsEditing] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllBookingsAdmin(token);
        const mappedData: Booking[] = data.map((item: any) => ({
          bookingId: item.id.toString(),
          carNo: item.Car?.id ? item.Car.id.toString() : "N/A",
          bookedBy: `${item.guest?.first_name || ""} ${
            item.guest?.last_name || ""
          }`.trim(),
          pickUpLoc: item.pickup_address,
          pickUpType: "Standard",
          dropOffLoc: item.drop_address,
          dropOffType: "Standard",
          startDatetime: item.start_datetime,
          endDatetime: item.end_datetime,
          driveType: "Self-drive",
          insure: Boolean(item.insure_amount && item.insure_amount > 0),
          payment: item.payment_status || "Pending",
          status: item.status,
          ratings: item.ratings || 0,
        }));
        setBookingData(mappedData);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to fetch bookings");
        setLoading(false);
      }
    }
    fetchBookings();
  }, [token]);

  const filteredBookings = useMemo(() => {
    return bookingData.filter((booking) => {
      const matchesSearch =
        booking.bookingId.toLowerCase().includes(search.toLowerCase()) ||
        booking.bookedBy.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All Status" || booking.status === statusFilter;
      const matchesCar =
        carFilter === "All Cars" || booking.carNo === carFilter;
      const bookingDate = new Date(booking.startDatetime);
      const bookingMonth = months[bookingDate.getMonth()];
      const bookingYear = bookingDate.getFullYear().toString();
      const matchesDate =
        (selectedMonth === "All Months" || bookingMonth === selectedMonth) &&
        (selectedYear === "All Years" || bookingYear === selectedYear);
      return matchesSearch && matchesStatus && matchesCar && matchesDate;
    });
  }, [
    search,
    statusFilter,
    carFilter,
    selectedMonth,
    selectedYear,
    bookingData,
  ]);

  const paginatedBookings = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, page]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize);

  const uniqueStatuses = [
    "All Status",
    ...Array.from(new Set(bookingData.map((b) => b.status))),
  ];
  const uniqueCars = [
    "All Cars",
    ...Array.from(new Set(bookingData.map((b) => b.carNo))),
  ];

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Active":
        return "status-active";
      case "Completed":
        return "status-completed";
      case "Cancelled":
        return "status-cancelled";
      case "Pending":
        return "status-pending";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return "🟢";
      case "Completed":
        return "✅";
      case "Cancelled":
        return "❌";
      case "Pending":
        return "⏳";
      default:
        return "●";
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }
    try {
      await deleteBooking(bookingId, token);
      setBookingData((prev) => prev.filter((b) => b.bookingId !== bookingId));
      if ((page - 1) * pageSize >= filteredBookings.length - 1 && page > 1) {
        setPage(page - 1);
      }
      toast.success("Booking deleted successfully");
    } catch (err) {
      alert("Failed to delete booking. Please try again.");
      console.error("Delete booking error:", err);
    }
  };

  // Open booking in edit modal
  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setIsEditing(true);
  };

  // Save edited booking
  const handleSaveEdit = async () => {
    if (!editingBooking) return;
    try {
      const updatedBooking = await updateBooking(
        editingBooking.bookingId,
        {
          // Send only editable fields - adjust as needed
          start_datetime: editingBooking.startDatetime,
          end_datetime: editingBooking.endDatetime,
          pickup_address: editingBooking.pickUpLoc,
          drop_address: editingBooking.dropOffLoc,
          status: editingBooking.status,
          insure_amount: editingBooking.insure ? 1 : 0, // example boolean to number
          payment_mode: "ZERO_RS",
          // Add others if needed
        },
        token,
      );
      setBookingData((prev) =>
        prev.map((b) =>
          b.bookingId === editingBooking.bookingId
            ? {
                ...b,
                ...{
                  startDatetime: updatedBooking.booking.start_datetime,
                  endDatetime: updatedBooking.booking.end_datetime,
                  pickUpLoc: updatedBooking.booking.pickup_address,
                  dropOffLoc: updatedBooking.booking.drop_address,
                  status: updatedBooking.booking.status,
                  insure: updatedBooking.booking.insure_amount > 0,
                },
              }
            : b,
        ),
      );
      toast.success("Booking updated successfully!");
      setIsEditing(false);
      setEditingBooking(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update booking");
    }
  };

  if (loading) {
    return (
      <>
        <AdminNavBar />
        <div className="booking-management">
          <h1 className="title">Booking Management</h1>
          <p>Loading bookings...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AdminNavBar />
        <div className="booking-management">
          <h1 className="title">Booking Management</h1>
          <p className="error">Error: {error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavBar />
      <Toaster position="top-right" />
      <div className="booking-management">
        <h1 className="title">Booking Management</h1>

        <div className="card">
          <div className="header-section">
            <h2 className="page-title">Bookings</h2>
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

          <div className="toolbar">
            <input
              type="text"
              placeholder="🔍 Search bookings by ID or booked by..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search"
            />
            <div className="filters">
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
              <select
                value={carFilter}
                onChange={(e) => {
                  setCarFilter(e.target.value);
                  setPage(1);
                }}
                className="filter-select"
              >
                {uniqueCars.map((car) => (
                  <option key={car} value={car}>
                    {car}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Car No</th>
                <th>Booked By</th>
                <th>Pick-up Loc</th>
                <th>Pick-up Type</th>
                <th>Drop-off Loc</th>
                <th>Drop-off Type</th>
                <th>Start Datetime</th>
                <th>End Datetime</th>
                <th>Drive Type</th>
                <th>Insure</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Ratings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.length > 0 ? (
                paginatedBookings.map((booking, index) => (
                  <tr
                    key={booking.bookingId}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td>{booking.bookingId}</td>
                    <td>{booking.carNo}</td>
                    <td>{booking.bookedBy}</td>
                    <td>{booking.pickUpLoc}</td>
                    <td>{booking.pickUpType}</td>
                    <td>{booking.dropOffLoc}</td>
                    <td>{booking.dropOffType}</td>
                    <td>{booking.startDatetime}</td>
                    <td>{booking.endDatetime}</td>
                    <td>{booking.driveType}</td>
                    <td>{booking.insure ? "Yes" : "No"}</td>
                    <td>{booking.payment}</td>
                    <td>
                      <span
                        className={`status ${getStatusClass(booking.status)}`}
                      >
                        {getStatusIcon(booking.status)} {booking.status}
                      </span>
                    </td>
                    <td>{booking.ratings.toFixed(1)}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="icon-btn"
                          title="View Details"
                          // Implement view details as needed
                        >
                          👁️
                        </button>
                        <button
                          className="icon-btn"
                          title="Edit Booking"
                          onClick={() => handleEdit(booking)}
                        >
                          ✏️
                        </button>
                        <button
                          className="icon-btn"
                          title="Cancel Booking"
                          onClick={() => handleDelete(booking.bookingId)}
                        >
                          ❌
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={15}>
                    <div className="empty">
                      <h3>No bookings found</h3>
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
                {filteredBookings.length} booking
                {filteredBookings.length !== 1 ? "s" : ""} found
              </span>
              <span className="page-number">
                Page {page} of {totalPages || 1}
              </span>
            </div>
            <div className="pagination-btns">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Previous
              </button>
              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditing && editingBooking && (
          <div
            className="booking-edit-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsEditing(false);
                setEditingBooking(null);
              }
            }}
          >
            <div className="booking-edit-box">
              <h2>Edit Booking</h2>
              {/* Start Datetime */}
              <label>Start Datetime</label>
              <input
                type="datetime-local"
                value={editingBooking.startDatetime}
                onChange={(e) =>
                  setEditingBooking({
                    ...editingBooking,
                    startDatetime: e.target.value,
                  })
                }
              />
              {/* End Datetime */}
              <label>End Datetime</label>
              <input
                type="datetime-local"
                value={editingBooking.endDatetime}
                onChange={(e) =>
                  setEditingBooking({
                    ...editingBooking,
                    endDatetime: e.target.value,
                  })
                }
              />
              {/* Pickup Location */}
              <label>Pick-up Location</label>
              <input
                type="text"
                value={editingBooking.pickUpLoc}
                onChange={(e) =>
                  setEditingBooking({
                    ...editingBooking,
                    pickUpLoc: e.target.value,
                  })
                }
              />
              {/* Dropoff Location */}
              <label>Drop-off Location</label>
              <input
                type="text"
                value={editingBooking.dropOffLoc}
                onChange={(e) =>
                  setEditingBooking({
                    ...editingBooking,
                    dropOffLoc: e.target.value,
                  })
                }
              />
              {/* Status */}
              <label>Status</label>
              <select
                value={editingBooking.status}
                onChange={(e) =>
                  setEditingBooking({
                    ...editingBooking,
                    status: e.target.value as Booking["status"],
                  })
                }
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Pending">Pending</option>
              </select>
              {/* Insure Checkbox */}
              <label>
                <input
                  type="checkbox"
                  checked={editingBooking.insure}
                  onChange={() =>
                    setEditingBooking({
                      ...editingBooking,
                      insure: !editingBooking.insure,
                    })
                  }
                />{" "}
                Insure
              </label>
              {/* Buttons */}
              <div className="booking-edit-buttons">
                <button onClick={handleSaveEdit}>Save</button>
                <button
                  className="booking-edit-cancel"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingBooking(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
