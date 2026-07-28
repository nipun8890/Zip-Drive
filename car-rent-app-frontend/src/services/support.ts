import axios from "axios";

// ================= Type Definitions =================

export interface SupportFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface SupportResponse {
  message: string;
}

// ================== API BASE URL ====================

const API_URL = `${import.meta.env.VITE_API_URL}/users`;

// ================= Support Message API ==============

export const sendSupportMessage = async (
  data: SupportFormData,
): Promise<SupportResponse> => {
  try {
    // Assuming your Express route is POST /api/users/support
    const res = await axios.post<SupportResponse>(
      `${API_URL}/support-mail`,
      data,
    );
    console.log("✅ Support message sent:", res.status, res.data);
    return res.data;
  } catch (err: any) {
    console.error(
      "❌ Error sending support message:",
      err.response?.status,
      err.response?.data || err.message,
    );
    // Throwing error so UI can display feedback
    throw err.response?.data || new Error("Support request failed");
  }
};
