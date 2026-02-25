import "./style.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const map = L.map("map", {
  minZoom: 14,
}).setView([20, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

fetch("/data.geojson")
  .then((response) => response.json())
  .then((data) => {
    const geojsonLayer = L.geoJSON(data);
    geojsonLayer.addTo(map);

    const bounds = geojsonLayer.getBounds();

    map.setMaxBounds(bounds);
    map.fitBounds(bounds);
  })
  .catch((error) => {
    console.error("Error loading GeoJSON:", error);
  });
