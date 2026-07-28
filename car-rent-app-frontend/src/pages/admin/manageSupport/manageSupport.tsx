import { useState, useMemo } from "react";
import AdminNavBar from "../../../components/AdminNavbar/AdminNavbar";
import "./manageSupport.css";

interface SupportTicket {
  ticketId: string;
  source: string;
  ticketRaisedBy: string;
  booking: string;
  date: string;
  issueDescription: string;
  isVerified: boolean;
  isResolved: boolean;
  remarks: string;
  action?: string;
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

const supportTickets: SupportTicket[] = [];

export default function ManageSupport() {
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All Months");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Resolved" | "Unresolved"
  >("All");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filteredTickets = useMemo(() => {
    return supportTickets.filter((ticket) => {
      const dateObj = new Date(ticket.date);
      const ticketMonth = months[dateObj.getMonth()];
      const ticketYear = dateObj.getFullYear().toString();

      const matchesMonth =
        selectedMonth === "All Months" || ticketMonth === selectedMonth;
      const matchesYear =
        selectedYear === "All Years" || ticketYear === selectedYear;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Resolved" && ticket.isResolved) ||
        (statusFilter === "Unresolved" && !ticket.isResolved);

      const lowerSearch = search.toLowerCase();

      const matchesSearch =
        ticket.ticketId.toLowerCase().includes(lowerSearch) ||
        ticket.ticketRaisedBy.toLowerCase().includes(lowerSearch) ||
        ticket.booking.toLowerCase().includes(lowerSearch) ||
        ticket.issueDescription.toLowerCase().includes(lowerSearch) ||
        ticket.remarks.toLowerCase().includes(lowerSearch);

      return matchesMonth && matchesYear && matchesStatus && matchesSearch;
    });
  }, [search, selectedMonth, selectedYear, statusFilter]);

  const paginatedTickets = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, page]);

  const totalPages = Math.ceil(filteredTickets.length / pageSize);

  return (
    <>
      <AdminNavBar />
      <div className="payment-management">
        <h1 className="title">Support Ticket Management</h1>

        <div className="card">
          <div className="header-section">
            <h2 className="page-title">Support Tickets</h2>

            <div className="date-filters">
              <select
                className="date-filter"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setPage(1);
                }}
              >
                <option value="All Months">All Months</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                className="date-filter"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setPage(1);
                }}
              >
                <option value="All Years">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
              >
                <option value="All">All Status</option>
                <option value="Resolved">Resolved</option>
                <option value="Unresolved">Unresolved</option>
              </select>
            </div>
          </div>

          <div className="toolbar">
            <input
              className="search"
              type="text"
              placeholder="🔍 Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Source</th>
                <th>Ticket raised by</th>
                <th>Booking</th>
                <th>Date</th>
                <th>Issue Description</th>
                <th>Is verified</th>
                <th>Is resolved</th>
                <th>Remarks</th>
                <th>Action</th>
                <th>Ratings</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTickets.length > 0 ? (
                paginatedTickets.map((ticket, idx) => (
                  <tr
                    key={ticket.ticketId}
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <td data-label="Ticket ID">{ticket.ticketId}</td>
                    <td data-label="Source">{ticket.source}</td>
                    <td data-label="Ticket raised by">
                      {ticket.ticketRaisedBy}
                    </td>
                    <td data-label="Booking">{ticket.booking}</td>
                    <td data-label="Date">
                      {new Date(ticket.date).toLocaleDateString()}
                    </td>
                    <td data-label="Issue Description">
                      {ticket.issueDescription}
                    </td>
                    <td data-label="Is verified">
                      {ticket.isVerified ? "✅" : "❌"}
                    </td>
                    <td data-label="Is resolved">
                      {ticket.isResolved ? "✅" : "❌"}
                    </td>
                    <td data-label="Remarks">{ticket.remarks}</td>
                    <td data-label="Action">{ticket.action || ""}</td>
                    <td data-label="Ratings">{ticket.ratings.toFixed(1)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="empty" colSpan={11}>
                    <h3>No tickets found</h3>
                    <p>Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination">
            <div className="pagination-text">
              <span className="results-count">
                {filteredTickets.length} ticket
                {filteredTickets.length !== 1 ? "s" : ""}
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
      </div>
    </>
  );
}
