import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHostCars, deleteCarById } from "../../services/carService";
import { updateCarDetails } from "../../services/carDetails";
import { updateCarFeatures } from "../../services/carFeatures";
import type { Car } from "../../types/Cars";
import Navbar from "../../components/Navbar/Navbar";
import styles from "./MyCars.module.css";

const FEATURES = [
  { key: "airconditions", label: "Air Conditioning", icon: "❄️" },
  { key: "child_seat", label: "Child Seat", icon: "👶" },
  { key: "gps", label: "GPS Navigation", icon: "📍" },
  { key: "luggage", label: "Luggage Space", icon: "🧳" },
  { key: "music", label: "Music System", icon: "🎵" },
  { key: "seat_belt", label: "Seat Belt", icon: "🔒" },
  { key: "sleeping_bed", label: "Sleeping Bed", icon: "🛏️" },
  { key: "water", label: "Water", icon: "💧" },
  { key: "bluetooth", label: "Bluetooth", icon: "📱" },
  { key: "onboard_computer", label: "Onboard Computer", icon: "💻" },
  { key: "audio_input", label: "Audio Input", icon: "🎧" },
  { key: "long_term_trips", label: "Long Term Trips", icon: "🚗" },
  { key: "car_kit", label: "Car Kit", icon: "🧰" },
  {
    key: "remote_central_locking",
    label: "Remote Central Locking",
    icon: "🔑",
  },
  { key: "climate_control", label: "Climate Control", icon: "🌡️" },
];

export default function MyCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [carToDelete, setCarToDelete] = useState<number | null>(null);
  const [carToEdit, setCarToEdit] = useState<Car | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // Edit form states
  const [editingFeatures, setEditingFeatures] = useState<
    Record<string, boolean>
  >({});
  const [editingPrice, setEditingPrice] = useState("");
  const [editingInsuranceCompany, setEditingInsuranceCompany] = useState("");
  const [editingIdvValue, setEditingIdvValue] = useState("");
  const [editingValidTill, setEditingValidTill] = useState("");
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pricingType, setPricingType] = useState<"hour" | "km">("hour");

  const fetchCars = async () => {
    try {
      const data = await getHostCars();

      if (Array.isArray(data.cars)) {
        const processedCars = data.cars.map((car: any) => ({
          ...car,
          photos: Array.isArray(car.photos) ? car.photos : [],
          price_per_hour: car.price_per_hour,
          price_per_km: car.price_per_km,
        }));

        setCars(processedCars);
      } else {
        setCars([]);
      }
    } catch (err) {
      console.error("Error fetching cars:", err);
      setCars([]);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleUpdate = (car: Car) => {
    setCarToEdit(car);

    // Initialize features
    const initialFeatures: Record<string, boolean> = {};
    FEATURES.forEach((feature) => {
      initialFeatures[feature.key] = !!(car as any).features?.[feature.key];
    });
    setEditingFeatures(initialFeatures);

    // Initialize pricing type based on which price exists
    const hasKmPrice =
      car.price_per_km !== null && car.price_per_km !== undefined;
    const hasHourPrice =
      car.price_per_hour !== null && car.price_per_hour !== undefined;

    setPricingType(hasKmPrice ? "km" : "hour");

    // Set the appropriate price value
    let price = "";
    if (hasKmPrice && car.price_per_km != null) {
      price = car.price_per_km.toString();
    } else if (hasHourPrice && car.price_per_hour != null) {
      price = car.price_per_hour.toString();
    }
    setEditingPrice(price);

    setEditingInsuranceCompany((car as any).insurance?.company || "");
    setEditingIdvValue((car as any).insurance?.idv_value?.toString() || "");
    setEditingValidTill((car as any).insurance?.valid_till || "");
    setSelectedImage(null);
    setImagePreview(null);

    setShowEditModal(true);
  };

  const handleDetails = (carId: number) => {
    navigate(`/car-details/${carId}`);
  };

  const handleDeleteClick = (carId: number) => {
    setCarToDelete(carId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (carToDelete === null) return;

    setIsDeleting(true);
    try {
      const response = await deleteCarById(carToDelete);

      if (response.status === "deleted") {
        alert(`Car ${getCarName(carToDelete)} deleted successfully!`);
        await fetchCars();
      } else if (response.status === "hidden") {
        alert(
          `Car ${getCarName(carToDelete)} has past bookings and is now hidden.`,
        );
        await fetchCars();
      } else if (response.status === "active_booking") {
        alert(
          `Cannot delete ${getCarName(
            carToDelete,
          )} because it has active or future bookings.`,
        );
      } else {
        alert(`Unexpected response: ${JSON.stringify(response)}`);
      }

      setShowDeleteModal(false);
      setCarToDelete(null);
    } catch (err: any) {
      console.error("❌ Error deleting car:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to delete car";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCarToDelete(null);
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setCarToEdit(null);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async () => {
    if (!carToEdit) return;

    setIsSaving(true);
    try {
      const carId = carToEdit.id;

      // ✅ 1. Update FEATURES first (separate API call)
      const cleanFeatures: Record<string, boolean> = {};
      FEATURES.forEach((feature) => {
        cleanFeatures[feature.key] = !!editingFeatures[feature.key];
      });
      await updateCarFeatures(carId, cleanFeatures);

      // ✅ 2. Update PRICE + INSURANCE (existing API)
      const updatePayload: any = {
        car_id: carId,
      };

      // Add pricing based on selected type
      // ONLY send the price field that's being used, don't send null for the other
      if (editingPrice && editingPrice.trim()) {
        if (pricingType === "hour") {
          updatePayload.price_per_hour = parseFloat(editingPrice);
          // Don't send price_per_km at all (backend should handle clearing if needed)
        } else {
          updatePayload.price_per_km = parseFloat(editingPrice);
          // Don't send price_per_hour at all (backend should handle clearing if needed)
        }
      }

      // Add insurance details
      if (editingInsuranceCompany) {
        updatePayload.insurance_company = editingInsuranceCompany;
      }
      if (editingIdvValue) {
        updatePayload.insurance_idv_value = parseFloat(editingIdvValue);
      }
      if (editingValidTill) {
        updatePayload.insurance_valid_till = editingValidTill;
      }
      if (selectedImage) {
        updatePayload.insurance_image = selectedImage;
      }

      console.log("💾 Saving with payload:", updatePayload);

      await updateCarDetails(updatePayload);

      alert("✅ Car updated successfully!");
      setShowEditModal(false);
      setCarToEdit(null);
      await fetchCars(); // Refresh list
    } catch (err: any) {
      console.error("❌ Update error:", err);
      alert(err.response?.data?.message || "Failed to update car");
    } finally {
      setIsSaving(false);
    }
  };

  const getCarName = (carId: number) => {
    const car = cars.find((c) => c.id === carId);
    return car ? `${car.make} ${car.model}` : "this car";
  };

  return (
    <>
      <Navbar />
      <div className={styles.myCarsScopeWrapper}>
        <div className={styles.myCarsPage}>
          <div className={styles.pageHeader}>
            <h2>My Listed Cars</h2>
            <p className={styles.subtitle}>
              Manage and view all your listed vehicles
            </p>
          </div>

          <div className={styles.carsGrid}>
            {cars.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🚗</div>
                <p>No cars found.</p>
                <p className={styles.emptySubtitle}>
                  Start by adding your first vehicle
                </p>
              </div>
            ) : (
              cars.map((car) => {
                const mainImage =
                  car.photos && car.photos.length > 0 ? car.photos[0] : "";

                return (
                  <div key={car.id} className={styles.carCard}>
                    <div className={styles.carImageContainer}>
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={`${car.make} ${car.model}`}
                          className={styles.carImg}
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                            const placeholder = (e.target as HTMLElement)
                              .nextElementSibling;
                            if (placeholder)
                              placeholder.setAttribute(
                                "style",
                                "display: flex;",
                              );
                          }}
                        />
                      ) : null}
                      <div
                        className={styles.carImgPlaceholder}
                        style={{ display: mainImage ? "none" : "flex" }}
                      >
                        <span>📷</span>
                        <span>No Image</span>
                      </div>
                    </div>

                    <div className={styles.carInfo}>
                      <h3 className={styles.carTitle}>
                        {car.make} {car.model}
                      </h3>
                      <div className={styles.tripTypeBadges}>
                        {car.price_per_hour !== null && (
                          <span
                            className={`${styles.badge} ${styles.badgeSelfdrive}`}
                          >
                            Self-Drive
                          </span>
                        )}
                        {car.price_per_km !== null && (
                          <span
                            className={`${styles.badge} ${styles.badgeIntercity}`}
                          >
                            Intercity
                          </span>
                        )}
                      </div>

                      <div className={styles.carDetailsGrid}>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Year</span>
                          <span className={styles.detailValue}>{car.year}</span>
                        </div>
                        <div
                          className={`${styles.detailItem} ${styles.priceItem}`}
                        >
                          <span className={styles.detailLabel}>Price</span>

                          {car.price_per_hour !== null && (
                            <span
                              className={`${styles.detailValue} ${styles.detailValuePrice}`}
                            >
                              ₹{car.price_per_hour}/hr
                            </span>
                          )}

                          {car.price_per_km !== null && (
                            <span
                              className={`${styles.detailValue} ${styles.detailValuePrice}`}
                            >
                              ₹{car.price_per_km}/km
                            </span>
                          )}
                        </div>
                      </div>

                      {car.available_from && car.available_till && (
                        <div className={styles.availabilityBox}>
                          <span className={styles.availabilityLabel}>
                            Available
                          </span>
                          <span className={styles.availabilityDates}>
                            {new Date(car.available_from).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(car.available_till).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {car.documents && (
                        <div className={styles.documentInfo}>
                          <div className={styles.docItem}>
                            <span className={styles.docLabel}>RC Number:</span>
                            <span className={styles.docValue}>
                              {car.documents.rc_number}
                            </span>
                          </div>
                          <div className={styles.docItem}>
                            <span className={styles.docLabel}>Owner:</span>
                            <span className={styles.docValue}>
                              {car.documents.owner_name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={styles.carActions}>
                      <button
                        className={`${styles.actionBtn} ${styles.detailsBtn}`}
                        onClick={() => handleDetails(car.id)}
                      >
                        View Details
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.updateBtn}`}
                        onClick={() => handleUpdate(car)}
                      >
                        Update
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDeleteClick(car.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={handleDeleteCancel}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Confirm Delete</h3>
              <button
                className={styles.modalClose}
                onClick={handleDeleteCancel}
                disabled={isDeleting}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.warningIcon}>⚠️</div>
              <p>
                Are you sure you want to delete{" "}
                <strong>{getCarName(carToDelete!)}</strong>?
              </p>
              <p className={styles.warningText}>
                This action cannot be undone.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={`${styles.modalBtn} ${styles.cancelBtn}`}
                onClick={handleDeleteCancel}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className={`${styles.modalBtn} ${styles.confirmBtn}`}
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Edit Modal */}
      {showEditModal && carToEdit && (
        <div className={styles.modalOverlay} onClick={handleEditCancel}>
          <div
            className={styles.premiumEditModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.premiumModalHeader}>
              <div className={styles.modalHeaderContent}>
                <div>
                  <h3 className={styles.modalTitle}>Edit Car Details</h3>
                  <p className={styles.modalSubtitle}>
                    {carToEdit.make} {carToEdit.model} • {carToEdit.year}
                  </p>
                </div>
              </div>
              <button
                className={styles.premiumCloseBtn}
                onClick={handleEditCancel}
                disabled={isSaving}
              >
                ×
              </button>
            </div>

            <div className={styles.premiumModalBody}>
              {/* Features Section with Toggle Switches */}
              <div className={styles.premiumSection}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionIcon}>🎯</span>
                  <h4 className={styles.sectionTitle}>Features</h4>
                </div>
                <div className={styles.featuresToggleGrid}>
                  {FEATURES.map((feature) => (
                    <div key={feature.key} className={styles.toggleItem}>
                      <div className={styles.toggleLabelWrapper}>
                        <span className={styles.toggleIcon}>
                          {feature.icon}
                        </span>
                        <span className={styles.toggleLabel}>
                          {feature.label}
                        </span>
                      </div>
                      <label className={styles.toggleSwitch}>
                        <input
                          type="checkbox"
                          checked={!!editingFeatures[feature.key]}
                          onChange={(e) =>
                            setEditingFeatures((prev) => ({
                              ...prev,
                              [feature.key]: e.target.checked,
                            }))
                          }
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Section */}
              <div className={styles.premiumSection}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionIcon}>💰</span>
                  <h4 className={styles.sectionTitle}>Pricing</h4>
                </div>

                <div className={styles.pricingTypeToggle}>
                  <label>
                    <input
                      type="radio"
                      checked={pricingType === "hour"}
                      onChange={() => setPricingType("hour")}
                    />
                    Per Hour (Self-Drive)
                  </label>

                  <label>
                    <input
                      type="radio"
                      checked={pricingType === "km"}
                      onChange={() => setPricingType("km")}
                    />
                    Per KM (Intercity)
                  </label>
                </div>

                <div className={styles.premiumInputWrapper}>
                  <label className={styles.premiumLabel}>
                    {pricingType === "hour" ? "Hourly Rate" : "Per KM Rate"}
                  </label>
                  <div className={styles.inputWithIcon}>
                    <span className={styles.inputIcon}>₹</span>
                    <input
                      type="number"
                      value={editingPrice}
                      onChange={(e) => setEditingPrice(e.target.value)}
                      className={styles.premiumInput}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Insurance Section */}
              <div className={styles.premiumSection}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionIcon}>🛡️</span>
                  <h4 className={styles.sectionTitle}>Insurance Details</h4>
                </div>

                <div className={styles.insuranceGrid}>
                  <div className={styles.premiumInputWrapper}>
                    <label className={styles.premiumLabel}>
                      Insurance Company
                    </label>
                    <input
                      type="text"
                      value={editingInsuranceCompany}
                      onChange={(e) =>
                        setEditingInsuranceCompany(e.target.value)
                      }
                      placeholder="e.g., ICICI Lombard"
                      className={styles.premiumInput}
                    />
                  </div>

                  <div className={styles.premiumInputWrapper}>
                    <label className={styles.premiumLabel}>IDV Value</label>
                    <div className={styles.inputWithIcon}>
                      <span className={styles.inputIcon}>₹</span>
                      <input
                        type="number"
                        value={editingIdvValue}
                        onChange={(e) => setEditingIdvValue(e.target.value)}
                        placeholder="Insured Declared Value"
                        className={styles.premiumInput}
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className={styles.premiumInputWrapper}>
                    <label className={styles.premiumLabel}>Valid Till</label>
                    <input
                      type="date"
                      value={editingValidTill}
                      onChange={(e) => setEditingValidTill(e.target.value)}
                      className={styles.premiumInput}
                    />
                  </div>

                  <div
                    className={`${styles.premiumInputWrapper} ${styles.fullWidth}`}
                  >
                    <label className={styles.premiumLabel}>
                      Insurance Document
                    </label>
                    <div className={styles.fileUploadArea}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className={styles.fileInputHidden}
                        id="insurance-upload"
                      />
                      <label
                        htmlFor="insurance-upload"
                        className={styles.fileUploadLabel}
                      >
                        <span className={styles.uploadIcon}>📎</span>
                        <span className={styles.uploadText}>
                          {selectedImage
                            ? selectedImage.name
                            : "Click to upload insurance document"}
                        </span>
                      </label>
                    </div>
                    {imagePreview && (
                      <div className={styles.premiumImagePreview}>
                        <img src={imagePreview} alt="Insurance preview" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.premiumModalFooter}>
              <button
                className={`${styles.premiumBtn} ${styles.premiumBtnCancel}`}
                onClick={handleEditCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className={`${styles.premiumBtn} ${styles.premiumBtnSave}`}
                onClick={handleSaveEdit}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className={styles.spinner}></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
