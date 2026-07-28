import { useState, useMemo, useEffect } from "react";
import AdminNavBar from "../../../components/AdminNavbar/AdminNavbar";
import { getAllHosts, deleteUser } from "../../../services/admin"; // Ensure the import path is correct
import "./manageHosts.css";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: "admin" | "host" | "guest";
  is_verified: boolean;
  // Extend with more fields if your backend provides them
}

interface Host {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  id1Verified: boolean; // ID 1 verified
  status: "Active" | "Inactive" | "Pending";
  joinDate: string;
  rating: number;
  action?: string;
}

const pageSize = 5;

export default function ManageHosts() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [filter, setFilter] = useState<
    "All" | "Active" | "Inactive" | "Pending"
  >("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Fetch token from localStorage
  const token = localStorage.getItem("token") || "";

  // Fetch hosts (users with role 'host') from API
  useEffect(() => {
    const fetchHostsData = async () => {
      try {
        const users: User[] = await getAllHosts(); // Your API call
        const mappedHosts: Host[] = users.map((user) => ({
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          address: "Unknown Address", // Placeholder, extend backend to provide real data
          city: "Unknown City", // Placeholder
          id1Verified: user.is_verified,
          status: user.is_verified ? "Active" : "Pending", // Example
          joinDate: "2025-01-01", // Placeholder, extend backend to provide real data
          rating: 0, // Placeholder, extend backend to provide ratings
        }));
        setHosts(mappedHosts);
      } catch (error) {
        console.error("Failed to load hosts:", error);
      }
    };
    fetchHostsData();
  }, []);

  // Filtered hosts based on search and status filter
  const filteredHosts = useMemo(() => {
    return hosts.filter((host) => {
      const matchesSearch =
        host.firstName.toLowerCase().includes(search.toLowerCase()) ||
        host.lastName.toLowerCase().includes(search.toLowerCase()) ||
        host.address.toLowerCase().includes(search.toLowerCase()) ||
        host.city.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter === "All" || host.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter, hosts]);

  // Pagination logic
  const paginatedHosts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredHosts.slice(start, start + pageSize);
  }, [filteredHosts, page]);

  const totalPages = Math.ceil(filteredHosts.length / pageSize);

  // Handle delete host
  const handleDelete = async (hostId: number) => {
    if (!window.confirm("Are you sure you want to delete this host?")) return;
    try {
      await deleteUser(token, hostId.toString()); // Your API call
      // Remove host from local state
      setHosts((prev) => prev.filter((host) => host.id !== hostId));
      // adjust page if necessary
      if ((page - 1) * pageSize >= filteredHosts.length - 1 && page > 1)
        setPage(page - 1);
    } catch (error) {
      console.error("Failed to delete host:", error);
      alert("Failed to delete host. Please try again.");
    }
  };

  return (
    <>
      <AdminNavBar />

      <div className="zipd-mc-main_5832">
        <h1 className="zipd-mc-title_5832">Host Management</h1>

        <div className="zipd-mc-card_5832">
          <div className="zipd-mc-toolbar_5832">
            <input
              type="text"
              placeholder="🔍 Search hosts by first name, last name, address or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="zipd-mc-search_5832"
            />

            {/* Filters */}
            <div className="zipd-mc-filters_5832">
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(
                    e.target.value as "All" | "Active" | "Inactive" | "Pending"
                  );
                  setPage(1);
                }}
                className="zipd-mc-filterselect_5832"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>

              {/* Date filter placeholder, extend as needed */}
              {/* <select> ... </select> */}
            </div>

            <button className="zipd-mc-addbtn_5832">Add Host</button>
          </div>

          {/* Hosts Table */}
          <table className="zipd-mc-table_5832">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Address</th>
                <th>City</th>
                <th>ID 1 Verified</th>
                <th>Status</th>
                <th>Ratings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedHosts.length > 0 ? (
                paginatedHosts.map((host, index) => (
                  <tr
                    key={host.id}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td>{host.firstName}</td>
                    <td>{host.lastName}</td>
                    <td>{host.address}</td>
                    <td>{host.city}</td>
                    <td>{host.id1Verified ? "✅" : "❌"}</td>
                    <td>
                      <span
                        className={`zipd-mc-status_5832 zipd-mc-status-${host.status.toLowerCase()}_5832`}
                      >
                        {host.status}
                      </span>
                    </td>
                    <td>
                      <div className="zipd-mc-rating_5832">
                        {renderStars(host.rating)}
                        <span>({host.rating.toFixed(1)})</span>
                      </div>
                    </td>
                    <td>
                      <div className="zipd-mc-actions_5832">
                        <button
                          className="zipd-mc-iconbtn_5832"
                          title="Edit Host"
                        >
                          ✏️
                        </button>
                        <button
                          className="zipd-mc-iconbtn_5832"
                          title="View Profile"
                        >
                          👁️
                        </button>
                        <button
                          className="zipd-mc-iconbtn_5832 delete"
                          title="Delete Host"
                          onClick={() => handleDelete(host.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8}>
                    <div className="zipd-mc-empty_5832">
                      <h3>No hosts found</h3>
                      <p>Try adjusting your search criteria or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="zipd-mc-pagination_5832">
            <div className="zipd-mc-paginationtext_5832">
              <span className="zipd-mc-results-count_5832">
                {filteredHosts.length} host
                {filteredHosts.length !== 1 ? "s" : ""} found
              </span>
              <span className="zipd-mc-page-number_5832">
                Page {page} of {totalPages || 1}
              </span>
            </div>

            <div className="zipd-mc-paginationbtns_5832">
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

// Helper to render stars for ratings
const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <span key={i} className="star-full">
        ★
      </span>
    );
  }
  if (hasHalfStar) {
    stars.push(
      <span key="half" className="star-half">
        ☆
      </span>
    );
  }
  return stars;
};
