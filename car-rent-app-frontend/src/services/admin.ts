import axios from "axios";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: "admin" | "host" | "guest";
  is_verified: boolean;

  // 🔹 document-related flags (derived on backend)
  hasPendingVerification?: boolean;
  documentsVerified?: boolean;
}

const API_URL = `${import.meta.env.VITE_API_URL}/users`;
const DOCUMENT_API_URL = `${import.meta.env.VITE_API_URL}/user-document`;

export const getAllUsers = async (): Promise<User[]> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found");

  const response = await axios.get<User[]>(`${API_URL}/all-users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteUser = async (
  token: string,
  userId: string,
): Promise<{ message: string }> => {
  try {
    const response = await axios.delete(`${API_URL}/delete-user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error deleting user:",
      error.response?.status,
      error.response?.data || error.message,
    );
    throw error.response?.data || new Error("Delete user failed");
  }
};

export const getAllHosts = async (): Promise<User[]> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found");

  const response = await axios.get<User[]>(`${API_URL}/get-hosts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateUser = async (
  token: string,
  userId: string,
  updateData: Partial<User>,
): Promise<User> => {
  try {
    const response = await axios.put<User>(
      `${API_URL}/update-user/${userId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error updating user:",
      error.response?.status,
      error.response?.data || error.message,
    );
    throw error.response?.data || new Error("Update user failed");
  }
};

export const updateDocumentStatus = async (
  token: string,
  documentId: number,
  status: "Pending" | "Verified" | "Rejected",
  rejection_reason?: string,
) => {
  const response = await axios.patch(
    `${DOCUMENT_API_URL}/admin/update-status/${documentId}`,
    {
      status,
      rejection_reason: status === "Rejected" ? rejection_reason : null,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
};

// Bulk update multiple documents
export const bulkUpdateDocuments = async (
  token: string,
  updates: Array<{
    documentId: number;
    status: "Pending" | "Verified" | "Rejected";
    rejection_reason?: string;
    userId?: number;
  }>,
) => {
  const response = await axios.post(
    `${DOCUMENT_API_URL}/admin/bulk-update`,
    { updates },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    },
  );
  return response.data;
};

// Get pending documents
export const getPendingDocuments = async (token: string) => {
  const response = await axios.get(
    `${API_URL}/admin/get-pending-documents`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
};
