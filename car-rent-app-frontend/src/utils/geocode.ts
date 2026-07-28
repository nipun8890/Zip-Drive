// utils/geocode.ts

// This function converts an address string to lat/lng coordinates using LocationIQ forward geocoding
export interface GeocodeResult {
  lat: number | null;
  lng: number | null;
  display_name: string;
  city?: string;
  state?: string;
  country?: string;
}

export async function geocodeAddress(
  address: string,
  apiKey: string
): Promise<GeocodeResult | null> {
  if (!address) return null;

  try {
    const res = await fetch(
      `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(
        address
      )}&format=json&limit=1`
    );
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      const place = data[0];
      return {
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
        display_name: place.display_name,
        city:
          place.address?.city ||
          place.address?.town ||
          place.address?.village ||
          "",
        state: place.address?.state || "",
        country: place.address?.country || "",
      };
    }
    return null;
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
}
