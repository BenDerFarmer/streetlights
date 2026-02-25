import "./style.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { buildPopupContent } from "./dropDown.js";

export const map = L.map("map", {
  minZoom: 14,
}).setView([20, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

function getLampFilter(type) {
  switch ((type || "").toLowerCase()) {
    case "led":
      return "brightness(1.2) sepia(1) hue-rotate(180deg) saturate(3)";
      break;
    case "high_pressure_sodium":
      return "sepia(100%) saturate(1500%) hue-rotate(-40deg) brightness(95%);";
      break;
    default:
      return "sepia(100%) saturate(1000%) hue-rotate(0deg) brightness(90%);";
  }
}

export function createLightIcon(lampType, size = 28) {
  const filter = getLampFilter(lampType);
  const html = `
    <img
      src="/light.png"
      alt="lamp"
      style="
        width: ${size}px;
        height: ${size}px;
        display:block;
        filter: ${filter};
        transform: translateZ(0);
      "
    />
  `;
  return L.divIcon({
    className: "",
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function pointToLayer(feature, latlng) {
  const lampType = feature.properties?.lamp_type;
  const marker = L.marker(latlng, { icon: createLightIcon(lampType) });

  marker.on("popupopen", () => {
    const popupContent = buildPopupContent(feature, marker);
    marker.getPopup().setContent(popupContent);
  });

  marker.bindPopup("Loading...");

  return marker;
}

fetch("/data.geojson")
  .then((res) => {
    if (!res.ok) throw new Error("Failed to load data.geojson: " + res.status);
    return res.json();
  })
  .then((data) => {
    parseData(data);
  })
  .catch((err) => {
    console.error("Error reading GeoJSON:", err);
  });

function parseData(data) {
  const layer = L.geoJSON(data, {
    pointToLayer,
  }).addTo(map);

  const bounds = layer.getBounds();

  map.setMaxBounds(bounds);
  map.fitBounds(bounds);
}

let params = new URLSearchParams(document.location.search);
let key = params.get("key");

if (key != null) {
  window.isLoggedIn = true;
}
