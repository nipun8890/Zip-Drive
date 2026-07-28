"use client";
import { useEffect, useMemo, useState } from "react";
import {
  getAllUsers,
  deleteUser,
  updateUser,
  bulkUpdateDocuments,
} from "../../../services/admin";
import AdminNavBar from "../../../components/AdminNavbar/AdminNavbar";
import toast, { Toaster } from "react-hot-toast";
import "./manageGuest.css";

type Document = {
  id: number;
  doc_type: string;
  verification_status: "Pending" | "Verified" | "Rejected";
  image: string;
  rejection_reason?: string | null;
  createdAt: string;
};

type Guest = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: "admin" | "host" | "guest";
  is_verified: boolean;
  documents: Document[];
};

type DocumentStatusChange = {
  status: "Pending" | "Verified" | "Rejected";
  reason: string;
};

const ManageGuests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [documentStatuses, setDocumentStatuses] = useState<{
    [key: number]: DocumentStatusChange;
  }>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const guestsPerPage = 8;

  // ✅ Fetch guests
  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();

      const guestUsers = res
        .filter((u: any) => u.role === "guest")
        .map((u: any) => ({
          ...u,
          documents: u.documents || [],
        }));

      setGuests(guestUsers);
    } catch (err: any) {
      console.error("Failed to fetch guests:", err);
      toast.error(err?.response?.data?.error || "Failed to load guests");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Safe filtering
  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const fullName = `${guest.first_name || ""} ${
        guest.last_name || ""
      }`.toLowerCase();
      const email = guest.email?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });
  }, [guests, searchQuery]);

  // ✅ Pagination
  const totalPages = Math.ceil(filteredGuests.length / guestsPerPage);
  const displayedGuests = filteredGuests.slice(
    (currentPage - 1) * guestsPerPage,
    currentPage * guestsPerPage,
  );

  // ✅ Edit guest
  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest);
    setIsEditing(true);

    // Initialize document statuses with current values
    const initialStatuses: { [key: number]: DocumentStatusChange } = {};
    guest.documents.forEach((doc) => {
      initialStatuses[doc.id] = {
        status: doc.verification_status,
        reason: doc.rejection_reason || "",
      };
    });
    setDocumentStatuses(initialStatuses);
  };

  // ✅ Handle document status change
  const handleDocumentStatusChange = (
    docId: number,
    newStatus: "Pending" | "Verified" | "Rejected",
  ) => {
    setDocumentStatuses((prev) => ({
      ...prev,
      [docId]: {
        status: newStatus,
        reason: newStatus !== "Rejected" ? "" : prev[docId]?.reason || "",
      },
    }));
  };

  // ✅ Handle rejection reason change
  const handleRejectionReasonChange = (docId: number, reason: string) => {
    setDocumentStatuses((prev) => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        reason: reason,
      },
    }));
  };

  // ✅ Download document
  const handleDownloadDocument = async (imageUrl: string, docType: string) => {
    try {
      // Open in new tab for viewing
      window.open(imageUrl, "_blank");

      // Also attempt to download
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Get file extension from URL or default to jpg
      const extension = imageUrl.split(".").pop()?.split("?")[0] || "jpg";
      link.download = `${docType.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Document downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      // Fallback: just open in new tab
      window.open(imageUrl, "_blank");
    }
  };

  // ✅ Save edit with document updates
  const handleSaveEdit = async () => {
    if (!editingGuest) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    // Validation
    if (!editingGuest.first_name.trim()) {
      toast.error("First name is required");
      return;
    }
    if (!editingGuest.last_name.trim()) {
      toast.error("Last name is required");
      return;
    }
    if (!editingGuest.email.trim()) {
      toast.error("Email is required");
      return;
    }

    // Validate rejection reasons
    const rejectedWithoutReason = editingGuest.documents.find((doc) => {
      const status = documentStatuses[doc.id];
      return status?.status === "Rejected" && !status.reason.trim();
    });

    if (rejectedWithoutReason) {
      toast.error("Please provide a reason for rejected documents");
      return;
    }

    setIsSaving(true);

    try {
      // 1. Update basic guest info
      await updateUser(token, String(editingGuest.id), {
        first_name: editingGuest.first_name.trim(),
        last_name: editingGuest.last_name.trim(),
        email: editingGuest.email.trim(),
        phone: editingGuest.phone.trim(),
      });

      // 2. Prepare document updates (only for changed documents)
      const documentUpdates = editingGuest.documents
        .filter((doc) => {
          const currentStatus = documentStatuses[doc.id];
          const hasStatusChanged =
            currentStatus && currentStatus.status !== doc.verification_status;
          const hasReasonChanged =
            currentStatus &&
            currentStatus.reason !== (doc.rejection_reason || "");
          return hasStatusChanged || hasReasonChanged;
        })
        .map((doc) => ({
          documentId: doc.id,
          status: documentStatuses[doc.id].status,
          rejection_reason: documentStatuses[doc.id].reason.trim(),
          userId: editingGuest.id,
        }));

      // 3. Bulk update documents if there are changes
      if (documentUpdates.length > 0) {
        console.log("Updating documents:", documentUpdates);

        const result = await bulkUpdateDocuments(token, documentUpdates);

        if (result.errors && result.errors.length > 0) {
          console.error("Some documents failed to update:", result.errors);
          toast.error(`Failed to update ${result.errors.length} document(s)`);
        } else {
          toast.success("Guest and documents updated successfully!");
        }
      } else {
        toast.success("Guest updated successfully!");
      }

      // 4. Update local state with new values
      setGuests((prev) =>
        prev.map((g) => {
          if (g.id === editingGuest.id) {
            const updatedDocuments = g.documents.map((doc) => ({
              ...doc,
              verification_status:
                documentStatuses[doc.id]?.status || doc.verification_status,
              rejection_reason:
                documentStatuses[doc.id]?.reason || doc.rejection_reason,
            }));

            // Check if user should be verified (all documents verified)
            const allVerified =
              updatedDocuments.length > 0 &&
              updatedDocuments.every(
                (doc) => doc.verification_status === "Verified",
              );

            return {
              ...g,
              first_name: editingGuest.first_name.trim(),
              last_name: editingGuest.last_name.trim(),
              email: editingGuest.email.trim(),
              phone: editingGuest.phone.trim(),
              documents: updatedDocuments,
              is_verified: allVerified,
            };
          }
          return g;
        }),
      );

      // Close modal and reset state
      setIsEditing(false);
      setEditingGuest(null);
      setDocumentStatuses({});
    } catch (err: any) {
      console.error("Save error:", err);
      const errorMessage =
        err?.response?.data?.error || "Failed to update guest";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Delete guest
  const handleDeleteGuest = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this guest?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    try {
      await deleteUser(token, String(id));
      setGuests((prev) => prev.filter((g) => g.id !== id));
      toast.success("Guest deleted successfully!");
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.error || "Failed to delete guest";
      toast.error(errorMessage);
    }
  };

  // ✅ Close modal
  const handleCloseModal = () => {
    if (isSaving) return;
    setIsEditing(false);
    setEditingGuest(null);
    setDocumentStatuses({});
  };

  if (loading) {
    return <div className="loading">Loading guests...</div>;
  }

  return (
    <>
      <AdminNavBar />
      <Toaster position="top-right" />
      <div className="manage-guests-container">
        {/* Header */}
        <div className="manage-guests-header">
          <h1>Manage Guests</h1>
          <button
            className="add-btn"
            onClick={() => toast("Feature coming soon!")}
          >
            + Add Guest
          </button>
        </div>

        <div className="content-card">
          {/* Filters */}
          <div className="filters">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="search-input"
            />
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="guest-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Verified Guest</th>
                  <th>Document Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedGuests.length > 0 ? (
                  displayedGuests.map((guest) => {
                    const hasPendingDocs = guest.documents.some(
                      (doc) => doc.verification_status === "Pending",
                    );

                    const hasRejectedDocs = guest.documents.some(
                      (doc) => doc.verification_status === "Rejected",
                    );

                    const allVerified =
                      guest.documents.length > 0 &&
                      guest.documents.every(
                        (doc) => doc.verification_status === "Verified",
                      );

                    return (
                      <tr key={guest.id}>
                        <td className="guest-name">
                          {guest.first_name} {guest.last_name}
                        </td>

                        <td className="guest-contact">{guest.email}</td>

                        <td>{guest.phone || "N/A"}</td>

                        <td>
                          <span
                            className={`status ${
                              guest.is_verified ? "active" : "inactive"
                            }`}
                          >
                            {guest.is_verified ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Document Status */}
                        <td>
                          {guest.documents.length === 0 && (
                            <span className="doc-badge none">
                              ⚪ No Documents
                            </span>
                          )}

                          {guest.documents.length > 0 && (
                            <>
                              {hasPendingDocs && (
                                <div className="doc-summary">
                                  <span className="doc-badge pending">
                                    🟠 Pending Review
                                  </span>
                                </div>
                              )}

                              {hasRejectedDocs && (
                                <div className="doc-summary">
                                  <span className="doc-badge rejected">
                                    🔴 Has Rejected
                                  </span>
                                </div>
                              )}

                              {!hasPendingDocs &&
                                !hasRejectedDocs &&
                                allVerified && (
                                  <div className="doc-summary">
                                    <span className="doc-badge verified">
                                      🟢 All Verified
                                    </span>
                                  </div>
                                )}
                            </>
                          )}
                        </td>

                        <td className="actions">
                          <button
                            className="edit"
                            onClick={() => handleEditGuest(guest)}
                            title="Edit guest"
                          >
                            ✏️
                          </button>
                          <button
                            className="delete"
                            onClick={() => handleDeleteGuest(guest.id)}
                            title="Delete guest"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="no-data">
                      No guests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                <span className="results-count">
                  Showing {displayedGuests.length} of {filteredGuests.length}
                </span>
              </div>
              <div className="pagination-controls">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Prev
                </button>
                <span className="page-number">{currentPage}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {isEditing && editingGuest && (
          <div
            className="guest-edit-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseModal();
              }
            }}
          >
            <div className="guest-edit-box">
              <h2>Edit Guest</h2>

              <div className="edit-form-row">
                <div className="edit-form-col">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={editingGuest.first_name}
                    onChange={(e) =>
                      setEditingGuest({
                        ...editingGuest,
                        first_name: e.target.value,
                      })
                    }
                    disabled={isSaving}
                    required
                  />
                </div>

                <div className="edit-form-col">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={editingGuest.last_name}
                    onChange={(e) =>
                      setEditingGuest({
                        ...editingGuest,
                        last_name: e.target.value,
                      })
                    }
                    disabled={isSaving}
                    required
                  />
                </div>
              </div>

              <label>Email *</label>
              <input
                type="email"
                value={editingGuest.email}
                onChange={(e) =>
                  setEditingGuest({
                    ...editingGuest,
                    email: e.target.value,
                  })
                }
                disabled={isSaving}
                required
              />

              <label>Phone</label>
              <input
                type="tel"
                value={editingGuest.phone}
                onChange={(e) =>
                  setEditingGuest({
                    ...editingGuest,
                    phone: e.target.value,
                  })
                }
                disabled={isSaving}
              />

              {/* Document Management Section */}
              {editingGuest.documents.length > 0 && (
                <div className="document-management-section">
                  <h3 className="document-section-title">
                    DOCUMENT MANAGEMENT
                  </h3>

                  {editingGuest.documents.map((doc) => {
                    const currentStatus =
                      documentStatuses[doc.id]?.status ||
                      doc.verification_status;

                    return (
                      <div key={doc.id} className="document-card">
                        <div className="document-header">
                          <div className="document-title-row">
                            <span className="document-type">
                              {doc.doc_type.toUpperCase()}
                            </span>
                            <span
                              className={`document-status-badge ${currentStatus.toLowerCase()}`}
                            >
                              {currentStatus.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="document-body">
                          {/* Document Preview */}
                          <div className="document-preview">
                            <img
                              src={doc.image}
                              alt={doc.doc_type}
                              className="document-image"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect fill='%23f0f0f0' width='200' height='150'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23999'%3EImage not available%3C/text%3E%3C/svg%3E";
                              }}
                            />
                            <button
                              className="download-btn"
                              onClick={() =>
                                handleDownloadDocument(doc.image, doc.doc_type)
                              }
                              type="button"
                              disabled={isSaving}
                            >
                              <span className="download-icon">⬇</span> Download
                            </button>
                          </div>

                          {/* Status Update Section */}
                          <div className="document-status-section">
                            <label className="status-label">
                              UPDATE STATUS
                            </label>
                            <select
                              className="status-select"
                              value={currentStatus}
                              onChange={(e) =>
                                handleDocumentStatusChange(
                                  doc.id,
                                  e.target.value as
                                    | "Pending"
                                    | "Verified"
                                    | "Rejected",
                                )
                              }
                              disabled={isSaving}
                            >
                              <option value="Pending">Pending Review</option>
                              <option value="Verified">Verified</option>
                              <option value="Rejected">Rejected</option>
                            </select>

                            {/* Rejection Reason - Only show if status is Rejected */}
                            {currentStatus === "Rejected" && (
                              <div className="rejection-reason-section">
                                <label className="status-label">
                                  REJECTION REASON *
                                </label>
                                <textarea
                                  className="rejection-textarea"
                                  placeholder="Enter the reason for rejection..."
                                  value={documentStatuses[doc.id]?.reason || ""}
                                  onChange={(e) =>
                                    handleRejectionReasonChange(
                                      doc.id,
                                      e.target.value,
                                    )
                                  }
                                  rows={3}
                                  disabled={isSaving}
                                  required
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="guest-edit-buttons">
                <button onClick={handleSaveEdit} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  className="guest-edit-cancel"
                  onClick={handleCloseModal}
                  disabled={isSaving}
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
};

export default ManageGuests;
