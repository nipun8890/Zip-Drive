import { useEffect, useState } from "react";
import { getRoadDistance } from "./../Map/RoadDistanceService";
import "./carDistance.css";

type Props = {
  pickup: { lat: number; lng: number };
  carLocation: { lat: number; lng: number };
};

export default function CarDistanceBadge({ pickup, carLocation }: Props) {
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    getRoadDistance(pickup, carLocation)
      .then((res) => {
        if (!cancelled) setDistance(res.distanceKm);
      })
      .catch(() => {
        if (!cancelled) setDistance(null);
      });

    return () => {
      cancelled = true;
    };
  }, [pickup.lat, pickup.lng, carLocation.lat, carLocation.lng]);

  if (distance === null) {
    return <span className="distance-loading">Calculating distance…</span>;
  }

  return <span className="distance-badge">🚗 {distance} km away</span>;
}
