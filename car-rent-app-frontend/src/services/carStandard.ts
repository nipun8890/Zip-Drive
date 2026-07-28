import axios from "axios";

// Interface representing CarStandards data structure
export interface CarStandards {
  car_id: number;
  mileage?: number;
  transmission?: string;
  seats?: number;
  luggage?: number;
  fuel?: string;
  car_range?: number;
}

// Use env variable for base URL
const API_URL = `${import.meta.env.VITE_API_URL}/car-standards`;

// POST to add or update car standards
export const addCarStandards = async (carStandardsData: CarStandards) => {
  const token = localStorage.getItem("token");

  console.log("📤 Sending Car Standards Data:", carStandardsData);

  const response = await axios.post(API_URL, carStandardsData, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return response.data;
};

// GET car standards by car_id
export const getCarStandards = async (carId: number) => {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${API_URL}/${carId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return response.data;
};
