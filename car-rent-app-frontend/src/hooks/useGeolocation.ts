import { useEffect, useState } from "react";

interface GeoState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

export function useGeoLocation(minAccuracy = 100, timeoutMs = 20000) {
  const [state, setState] = useState<GeoState>({
    lat: null,
    lng: null,
    accuracy: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Geolocation not supported",
      }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        if (accuracy <= minAccuracy) {
          setState({
            lat: latitude,
            lng: longitude,
            accuracy,
            loading: false,
            error: null,
          });
          navigator.geolocation.clearWatch(watchId);
        }
      },
      (err) => {
        setState((s) => ({
          ...s,
          loading: false,
          error: err.message,
        }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: timeoutMs,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [minAccuracy, timeoutMs]);

  return state;
}
