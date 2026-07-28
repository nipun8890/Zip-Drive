"use client";

import { useState, useMemo, useEffect } from "react";
import AdminNavBar from "../../../components/AdminNavbar/AdminNavbar";
import {
  deleteCarById,
  getAdminCars,
  editCar,
} from "../../../services/carService";
import "./manageCars.css";

export interface AdminCar {
  id: number;
  carNo: string;
  name: string;
  type: string;
  price: number;
  status: "Available" | "Rented";
  location: string;
  year: number;
  month: string;
  fuelType: string;
  seatingCapacity: number;
  hostedBy: string;
  isVerified: boolean;
  ratings: number;
}

export interface GetAdminCarsResponse {
  cars: AdminCar[];
}

export default function ManageCars() {
  const [carData, setCarData] = useState<AdminCar[]>([]);
  const [filter, setFilter] = useState<"All" | "Available" | "Rented">("All");
  const [typeFilter, setTypeFilter] = useState<string>("All Types");
  const [yearFilter, setYearFilter] = useState<string>("All Years");
  const [monthFilter, setMonthFilter] = useState<string>("All Months");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editingCar, setEditingCar] = useState<AdminCar | null>(null);
  const [editForm, setEditForm] = useState<Partial<AdminCar>>({});

  const pageSize = 5;

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const response = await getAdminCars();
        const carsArray = Array.isArray(response)
          ? response
          : Array.isArray(response?.cars)
          ? response.cars
          : [];
        setCarData(carsArray);
      } catch (error) {
        console.error("Failed to load cars:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const uniqueTypes = useMemo(
    () => ["All Types", ...new Set(carData.map((car) => car.type))],
    [carData]
  );
  const uniqueYears = useMemo(
    () => ["All Years", ...new Set(carData.map((car) => car.year.toString()))],
    [carData]
  );
  const uniqueMonths = useMemo(
    () => ["All Months", ...new Set(carData.map((car) => car.month))],
    [carData]
  );

  const filteredCars = useMemo(() => {
    return carData.filter((car) => {
      const matchesSearch =
        car.name.toLowerCase().includes(search.toLowerCase()) ||
        car.type.toLowerCase().includes(search.toLowerCase()) ||
        car.location.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = filter === "All" || car.status === filter;
      const matchesType = typeFilter === "All Types" || car.type === typeFilter;
      const matchesYear =
        yearFilter === "All Years" || car.year.toString() === yearFilter;
      const matchesMonth =
        monthFilter === "All Months" || car.month === monthFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesYear &&
        matchesMonth
      );
    });
  }, [carData, search, filter, typeFilter, yearFilter, monthFilter]);

  useEffect(() => {
    setPage(1);
  }, [filter, typeFilter, yearFilter, monthFilter, search]);

  const totalPages = Math.ceil(filteredCars.length / pageSize);
  const paginatedCars = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCars.slice(start, start + pageSize);
  }, [filteredCars, page]);

  const handleCarDelete = async (carId: number) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      setCarData((prevCars) => prevCars.filter((car) => car.id !== carId));
    }
    try {
      setLoading(true);
      await deleteCarById(carId);
      setCarData((prevCars) => prevCars.filter((car) => car.id !== carId));
    } catch (error) {
      console.error("Failed to delete car:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Edit Handlers
  const handleEditClick = (car: AdminCar) => {
    setEditingCar(car);
    setEditForm({ ...car });
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingCar) return;

    try {
      setLoading(true);
      const payload = {
        make: editForm.name?.split(" ")[0] || "",
        model: editForm.name?.split(" ")[1] || "",
        year: editForm.year,
        price_per_hour: editForm.price,
        city_of_registration: editForm.location,
        fuel_type: editForm.fuelType,
        seating_capacity: editForm.seatingCapacity,
        status: editForm.status,
        isVerified: editForm.isVerified,
      };

      await editCar(editingCar.id, payload);

      setCarData((prevCars) =>
        prevCars.map((car) =>
          car.id === editingCar.id ? { ...car, ...editForm } : car
        )
      );

      setEditingCar(null);
    } catch (error) {
      console.error("Failed to update car:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNavBar />
      <div className="zipd-mc-main_5832">
        <h1 className="zipd-mc-title_5832">Car Fleet Management</h1>

        {loading ? (
          <div className="loading">Loading cars...</div>
        ) : (
          <div className="zipd-mc-card_5832">
            {/* Filters */}
            <div className="zipd-mc-toolbar_5832">
              <input
                type="text"
                placeholder="🔍 Search cars by name, type, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="zipd-mc-search_5832"
              />

              <div className="zipd-mc-filters_5832">
                <select
                  value={filter}
                  onChange={(e) =>
                    setFilter(e.target.value as "All" | "Available" | "Rented")
                  }
                  className="zipd-mc-filterselect_5832"
                >
                  <option value="All">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Rented">Rented</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="zipd-mc-filterselect_5832"
                >
                  {uniqueTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="zipd-mc-filterselect_5832"
                >
                  {uniqueYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="zipd-mc-filterselect_5832"
                >
                  {uniqueMonths.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <button className="zipd-mc-addbtn_5832">Add Vehicle</button>
            </div>

            {/* Car Table */}
            <table className="zipd-mc-table_5832">
              <thead>
                <tr>
                  <th>Car ID</th>
                  <th>Car No</th>
                  <th>Make / Model</th>
                  <th>Fuel Type</th>
                  <th>Seating</th>
                  <th>Year</th>
                  <th>Month</th>
                  <th>Hourly Price</th>
                  <th>Location</th>
                  <th>Hosted by</th>
                  <th>Verified</th>
                  <th>Status</th>
                  <th>Ratings</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCars.length > 0 ? (
                  paginatedCars.map((car, index) => (
                    <tr
                      key={car.id}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td>{car.id}</td>
                      <td>{car.carNo}</td>
                      <td>
                        <div>
                          <div className="zipd-mc-carname_5832">{car.name}</div>
                          <div className="zipd-mc-cartype_5832">{car.type}</div>
                        </div>
                      </td>
                      <td>{car.fuelType}</td>
                      <td>{car.seatingCapacity}</td>
                      <td>{car.year}</td>
                      <td>{car.month}</td>
                      <td>{car.price}</td>
                      <td>{car.location}</td>
                      <td>{car.hostedBy}</td>
                      <td>{car.isVerified ? "✅" : "❌"}</td>
                      <td>
                        <span
                          className={`zipd-mc-status_5832 ${
                            car.status === "Available"
                              ? "zipd-mc-status-avail_5832"
                              : "zipd-mc-status-rented_5832"
                          }`}
                        >
                          {car.status}
                        </span>
                      </td>
                      <td>{car.ratings.toFixed(1)}</td>
                      <td>
                        <div className="zipd-mc-actions_5832">
                          <span
                            className="zipd-mc-iconbtn_5832"
                            title="Edit"
                            onClick={() => handleEditClick(car)}
                          >
                            ✏️
                          </span>
                          <span className="zipd-mc-iconbtn_5832" title="View">
                            👁️
                          </span>
                          <span
                            className="zipd-mc-iconbtn_5832"
                            title="Delete"
                            onClick={() => handleCarDelete(car.id)}
                          >
                            🗑️
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={14}
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      No vehicles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination">
              <div className="pagination-info">
                <div className="results-count">
                  Showing {(page - 1) * pageSize + 1}-
                  {Math.min(page * pageSize, filteredCars.length)} of{" "}
                  {filteredCars.length} vehicles
                </div>
                <div className="page-number">
                  Page {page} of {totalPages || 1}
                </div>
              </div>
              <div className="pagination-controls">
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
        )}

        {/* 🧩 Edit Modal */}
        {editingCar && (
          <div
            className="edit-modal"
            onClick={(e) => {
              // Close modal only when clicking outside the content box
              if (e.target === e.currentTarget) setEditingCar(null);
            }}
          >
            <div className="edit-modal-content">
              <h2>Edit Car Details</h2>

              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  value={editForm.name || ""}
                  onChange={handleEditChange}
                />
              </label>

              <label>
                Year:
                <input
                  type="number"
                  name="year"
                  value={editForm.year || ""}
                  onChange={handleEditChange}
                />
              </label>

              <label>
                Price:
                <input
                  type="number"
                  name="price"
                  value={editForm.price || ""}
                  onChange={handleEditChange}
                />
              </label>

              <label>
                Location:
                <input
                  type="text"
                  name="location"
                  value={editForm.location || ""}
                  onChange={handleEditChange}
                />
              </label>

              <label>
                Fuel Type:
                <input
                  type="text"
                  name="fuelType"
                  value={editForm.fuelType || ""}
                  onChange={handleEditChange}
                />
              </label>

              <label>
                Seating Capacity:
                <input
                  type="number"
                  name="seatingCapacity"
                  value={editForm.seatingCapacity || ""}
                  onChange={handleEditChange}
                />
              </label>

              <label>
                Status:
                <select
                  name="status"
                  value={editForm.status || "Available"}
                  onChange={handleEditChange}
                >
                  <option value="Available">Available</option>
                  <option value="Rented">Rented</option>
                </select>
              </label>

              <div className="edit-modal-buttons">
                <button onClick={handleSaveEdit}>Save</button>
                <button
                  style={{
                    background: "#ef4444",
                    boxShadow: "0 6px 16px rgba(239, 68, 68, 0.3)",
                  }}
                  onClick={() => setEditingCar(null)}
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
