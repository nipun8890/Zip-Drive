import axios from "axios";
import type { UserRegister, UserLogin, AuthResponse } from "../types/user";
import { jwtDecode } from "jwt-decode";

// ✅ Use Vite env variable instead of localhost
const API_URL = `${import.meta.env.VITE_API_URL}/users`;

export const registerUser = async (
  data: UserRegister,
): Promise<AuthResponse> => {
  try {
    const res = await axios.post<AuthResponse>(`${API_URL}/register`, data);
    console.log("✅ Register response:", res.status, res.data);
    return res.data;
  } catch (err: any) {
    console.error(
      "❌ Error registering user:",
      err.response?.status,
      err.response?.data || err.message,
    );
    throw err.response?.data || new Error("Registration failed");
  }
};

export const loginUser = async (data: UserLogin): Promise<AuthResponse> => {
  try {
    const res = await axios.post<AuthResponse>(`${API_URL}/login`, data);
    console.log("✅ Login response:", res.status, res.data);
    return res.data;
  } catch (err: any) {
    console.error(
      "❌ Error logging in:",
      err.response?.status,
      err.response?.data || err.message,
    );
    throw err.response?.data || new Error("Login failed");
  }
};

interface TokenPayload {
  role: "host" | "guest";
  // add userId, name, etc. if needed
}

export const getUserRole = (): "host" | "guest" | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.role;
  } catch {
    return null;
  }
};

export const fetchUserProfile = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      return response.data.user;
    } else {
      throw new Error(response.data.message || "Failed to fetch profile");
    }
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "API error",
    );
  }
};
