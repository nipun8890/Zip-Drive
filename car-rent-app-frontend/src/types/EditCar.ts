// src/types/EditCarTypes.ts
// Separate types specifically for the edit modal - won't affect existing code

export interface EditCarFeatures {
  airconditions: boolean;
  child_seat: boolean;
  gps: boolean;
  luggage: boolean;
  music: boolean;
  seat_belt: boolean;
  sleeping_bed: boolean;
  water: boolean;
  bluetooth: boolean;
  onboard_computer: boolean;
  audio_input: boolean;
  long_term_trips: boolean;
  car_kit: boolean;
  remote_central_locking: boolean;
  climate_control: boolean;
}

export interface EditCarInsurance {
  company: string;
  idv_value: string;
  valid_till: string;
  image: File | null;
}

export interface EditCarData {
  car_id: number;
  make: string;
  model: string;
  year: number;
  features: EditCarFeatures;
  price_per_hour: string;
  price_per_km: string;
  insurance: EditCarInsurance;
}

export interface UpdateCarPayload {
  car_id: number;
  features?: Record<string, boolean>;
  price_per_hour?: number | null;
  price_per_km?: number | null;
  insurance_company?: string;
  insurance_idv_value?: number;
  insurance_valid_till?: string;
  insurance_image?: File;
}

export const EDIT_CAR_FEATURES = [
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
] as const;
