"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapCase = {
  crop_label: string;
  disease: string;
  severity: string;
  distance_km: number;
  latitude: number;
  longitude: number;
  created_at: string;
};

type Props = {
  centerLat: number;
  centerLon: number;
  radiusKm: number;
  cases: MapCase[];
};

// Custom colored circle markers instead of Leaflet's default pin
// icon - avoids the well-known Leaflet + webpack/Next.js bundling
// issue with the default marker image paths, and lets us
// color-code each case by severity for free.
function severityColor(severity: string) {
  const normalized = severity.toLowerCase();

  if (normalized === "high") return "#d83a32";
  if (normalized === "medium") return "#f5a800";

  return "#6f9c13";
}

function buildIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: ${color};
      border: 2px solid white;
      box-shadow: 0 0 0 3px ${color}33;
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

const youAreHereIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #1c3d2e;
    border: 3px solid white;
    box-shadow: 0 0 0 4px rgba(28,61,46,0.25);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export default function AlertsMap({
  centerLat,
  centerLon,
  radiusKm,
  cases,
}: Props) {
  return (
    <MapContainer
      center={[centerLat, centerLon]}
      zoom={11}
      scrollWheelZoom={false}
      style={{ height: "260px", width: "100%", borderRadius: "22px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Circle
        center={[centerLat, centerLon]}
        radius={radiusKm * 1000}
        pathOptions={{
          color: "#1c3d2e",
          fillColor: "#1c3d2e",
          fillOpacity: 0.05,
          weight: 1,
        }}
      />

      <Marker position={[centerLat, centerLon]} icon={youAreHereIcon}>
        <Popup>Your location</Popup>
      </Marker>

      {cases.map((c, index) => (
        <Marker
          key={index}
          position={[c.latitude, c.longitude]}
          icon={buildIcon(severityColor(c.severity))}
        >
          <Popup>
            <strong>{c.disease}</strong>
            <br />
            {c.crop_label} &middot; {c.distance_km} km away
            <br />
            Severity: {c.severity}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
