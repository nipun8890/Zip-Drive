// src/services/booking.ts
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/bookings`;
const API_URL_SelfDrive = `${import.meta.env.VITE_API_URL}/self-drive-bookings`;
const API_URL_Intercity = `${import.meta.env.VITE_API_URL}/intercity-bookings`;

// The booking input type matches your API needs

export interface BookCarRequest {
  car_id: number;
  start_datetime: string;
  end_datetime: string;

  pickup_address: string;
  pickup_lat: number | null;
  pickup_long: number | null;

  drop_address: string;
  drop_lat: number | null;
  drop_long: number | null;

  insure_amount?: number;
  driver_amount?: number;
  drop_charge?: number;
  base_amount?: number;
  gst_amount?: number;
}

export interface BookCarResponse {
  message: string;
  booking: any;
}
export interface BookIntercityRequest {
  car_id: number;

  pickup_address: string;
  pickup_lat: number;
  pickup_long: number;

  drop_address: string;
  drop_lat: number;
  drop_long: number;

  pax: number;
  luggage: number;

  distance_km: number;
  driver_amount: number;

  total_amount: number;
  payment_mode: string;
}

export interface UpdateBookingRequest {
  start_datetime?: string;
  end_datetime?: string;
  pickup_address?: string;
  pickup_lat?: number | null;
  pickup_long?: number | null;
  drop_address?: string;
  drop_lat?: number;
  drop_long?: number;
  insure_amount?: number;
  driver_amount?: number;
  status?: string;
  payment_mode: string;
}

export interface UpdateBookingResponse {
  message: string;
  booking: any;
}

export const bookCar = async (
  bookingData: BookCarRequest,
  token: string,
): Promise<BookCarResponse> => {
  try {
    const res = await axios.post<BookCarResponse>(
      `${API_URL_SelfDrive}/book`,
      bookingData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data;
  } catch (err: any) {
    console.error(
      "❌ Error booking car:",
      err.response?.status,
      err.response?.data || err.message,
    );
    throw err.response?.data || new Error("Booking failed");
  }
};
export const bookCarIntercity = async (
  bookingData: BookIntercityRequest,
  token: string,
): Promise<BookCarResponse> => {
  try {
    const res = await axios.post<BookCarResponse>(
      `${API_URL_Intercity}/book`,
      bookingData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return res.data;
  } catch (err: any) {
    console.error(
      "❌ Error booking intercity car:",
      err.response?.status,
      err.response?.data || err.message,
    );
    throw err.response?.data || new Error("Intercity booking failed");
  }
};

export const getAllBookingsAdmin = async (token: string): Promise<any[]> => {
  try {
    const res = await axios.get<any[]>(`${API_URL}/admin/bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err: any) {
    console.error(
      "❌ Error fetching admin bookings:",
      err.response?.status,
      err.response?.data || err.message,
    );
    throw err.response?.data || new Error("Failed to fetch admin bookings");
  }
};

export const getHostBookings = async (token: string): Promise<any[]> => {
  try {
    const res = await axios.get<any[]>(`${API_URL}/host/bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err: any) {
    console.error(
      "❌ Error fetching host bookings:",
      err.response?.status,
      err.response?.data || err.message,
    );
    throw err.response?.data || new Error("Failed to fetch host bookings");
  }
};
export const getGuestBookings = async (token: string): Promise<any[]> => {
  try {
    const res = await axios.get<any[]>(`${API_URL}/guest/bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err: any) {
    console.error(
      "❌ Error fetching guest bookings:",
      err.response?.status,
      err.response?.data || err.message,
    );
    throw err.response?.data || new Error("Failed to fetch guest bookings");
  }
};

export const deleteBooking = async (
  bookingId: string,
  token: string,
): Promise<{ message: string }> => {
  try {
    const res = await axios.delete(`${API_URL}/delete-booking/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err: any) {
    console.error(
      "❌ Error deleting booking:",
      err.response?.status,
      err.response?.data || err.message,
    );
    throw err.response?.data || new Error("Delete booking failed");
  }
};

export const updateBooking = async (
  bookingId: string,
  updateData: UpdateBookingRequest,
  token: string,
): Promise<UpdateBookingResponse> => {
  try {
    const res = await axios.put<UpdateBookingResponse>(
      `${API_URL}/update-booking/${bookingId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data;
  } catch (err: any) {
    console.error(
      "❌ Error updating booking:",
      err.response?.status,
      err.response?.data || err.message,
    );
    throw err.response?.data || new Error("Update booking failed");
  }
};
