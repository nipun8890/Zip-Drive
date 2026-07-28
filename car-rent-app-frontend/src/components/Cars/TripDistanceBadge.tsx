import { useEffect, useState } from "react";
import { getRoadDistance } from "../Map/RoadDistanceService";
import "./carDistance.css";

type Props = {
  pickup: { lat: number; lng: number };
  drop: { lat: number; lng: number };
};

export default function TripDistanceBadge({ pickup, drop }: Props) {
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    getRoadDistance(pickup, drop)
      .then((res) => {
        if (!cancelled) setDistance(res.distanceKm);
      })
      .catch(() => {
        if (!cancelled) setDistance(null);
      });

    return () => {
      cancelled = true;
    };
  }, [pickup.lat, pickup.lng, drop.lat, drop.lng]);

  if (distance === null) {
    return <span className="distance-loading">Calculating trip distance…</span>;
  }

  return <span className="distance-badge">🛣️ {distance} km trip</span>;
}
