// src/components/common/LocationPickerModal/useCurrentLocation.ts
import { extractCityFromLocationIQ } from "./utils"; // we'll create this tiny util

/**
 * Hook to get current location + reverse geocode it using LocationIQ
 * Returns a function that performs the detection and a loading state
 */
export function useCurrentLocation() {
  const getCurrentLocation = async (): Promise<{
    lat: number;
    lng: number;
    address: string;
    city: string;
    state?: string;
  }> => {
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported by your browser.");
    }

    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            let message = "Unable to retrieve your location.";
            switch (error.code) {
              case error.PERMISSION_DENIED:
                message = "Location access denied. Please enable permissions.";
                break;
              case error.POSITION_UNAVAILABLE:
                message = "Location information is unavailable.";
                break;
              case error.TIMEOUT:
                message = "Location request timed out.";
                break;
            }
            reject(new Error(message));
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      }
    );

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const token = import.meta.env.VITE_LOCATIONIQ_TOKEN;
    if (!token) {
      throw new Error("LocationIQ API token is missing.");
    }

    const response = await fetch(
      `https://us1.locationiq.com/v1/reverse.php?key=${token}&lat=${lat}&lon=${lng}&format=json&addressdetails=1&normalizeaddress=1`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch address.");
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    const city = extractCityFromLocationIQ(data);

    return {
      lat,
      lng,
      address: data.display_name,
      city,
      state: data.address?.state || "",
    };
  };

  return { getCurrentLocation };
}
