import L from "leaflet";
import "leaflet-routing-machine";

export function getRoadDistance(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<{ distanceKm: number; durationMin: number }> {
  return new Promise((resolve, reject) => {
    const router = L.Routing.osrmv1({
      serviceUrl: "https://router.project-osrm.org/route/v1",
    });

    const waypoints = [
      L.Routing.waypoint(L.latLng(from.lat, from.lng)),
      L.Routing.waypoint(L.latLng(to.lat, to.lng)),
    ];

    router.route(waypoints, ((err: any, routes: L.Routing.IRoute[]) => {
      if (err || !routes || !routes.length) {
        reject(err || "No route found");
        return;
      }

      const route = routes[0];
      const summary = route.summary;
      if (!summary) {
        reject("Invalid route summary");
        return;
      }

      resolve({
        distanceKm: +(summary.totalDistance / 1000).toFixed(2),
        durationMin: Math.round(summary.totalTime / 60),
      });
    }) as any);
  });
}
