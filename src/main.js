import "./style.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchData } from "./loader";

export const map = L.map("map", {
  minZoom: 14,
}).setView([20, 0], 2);

export const tileLayer = L.tileLayer(
  "https://tile.openstreetmap.de/{z}/{x}/{y}.png ",
  {
    attribution: "&copy; OpenStreetMap contributors",
  },
).addTo(map);

let params = new URLSearchParams(document.location.search);
export const auth = params.get("key");

fetchData();
