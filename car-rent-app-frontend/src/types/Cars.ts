// src/types/Cars.ts

export interface Car {
  id: number;
  name?: string; // if backend sends it
  brand?: string; // if backend sends it
  make: string;
  price: number;
  model: string;
  year: number;
  location?: string; // ✅ Added location
  price_per_hour: number | null;
  kms_driven?: number;
  available_from?: string | null;
  available_till?: string | null;
  image?: string | null; // single thumbnail if provided
  photos?: string[]; // ✅ array of images
  reviews?: string[];
  capabilities?: CarCapabilities;
  price_per_km: number;
  documents?: {
    car_id: number;
    rc_image_front: string | null;
    rc_image_back: string | null;
    owner_name: string;
    insurance_company: string;
    insurance_idv_value: string | number;
    insurance_image: string | null;
    rc_number: string;
    rc_valid_till: string;
    city_of_registration: string;
    fastag_image: string | null;
    trip_start_balance: string | null;
    trip_end_balance: string | null;
  };
}
export type DropPricingType = "Fixed" | "Percentage" | "None";

export interface CarCapabilities {
  self_pickup: boolean;
  doorstep_drop: boolean;
  drop_pricing_type: DropPricingType;
  drop_amount: number | null;
}

export interface CarFormData {
  mileage?: number;
  car_range?: number;
  make?: string;
  model?: string;
  year?: number;
  description?: string;
  handType?: "First" | "Second";
  registrationType?: "Private" | "Commercial";
  ownerName?: string;
  registrationNo?: string;
  cityOfRegistration?: string;
  rcValidTill?: string;
  rcFrontFile?: File;
  rcBackFile?: File;
  insurance_company?: string;
  insurance_idv_value?: number;
  insurance_valid_till?: string;
  insurance_image?: File;
  fastTag?: boolean;
  airconditions?: boolean;
  seats?: number;
  fuel?: string;
  gps?: boolean;
  geofencing?: boolean;
  antiTheft?: boolean;
  child_seat?: boolean;
  luggage?: boolean;
  music?: boolean;
  seat_belt?: boolean;
  sleeping_bed?: boolean;
  water?: boolean;
  bluetooth?: boolean;
  onboard_computer?: boolean;
  audio_input?: boolean;
  long_term_trips?: boolean;
  car_kit?: boolean;
  remote_central_locking?: boolean;
  climate_control?: boolean;
  images?: File[];
  expectedHourlyRent?: number;
  availabilityFrom?: string;
  availabilityTill?: string;
}
export interface AddCarApiResponse {
  make: string;
  model: string;
  year: number;
}
export interface CarFeatures {
  car_id: number;
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
