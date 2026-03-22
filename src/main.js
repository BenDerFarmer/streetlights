import "./style.css";
import Map from "ol/Map.js";
import View from "ol/View.js";
import OSM from "ol/source/OSM.js";
import TileLayer from "ol/layer/Tile.js";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { MenuControl } from "./controls.js";
import { fetchData } from "./api.js";
import { defaults as defaultControls } from "ol/control/defaults.js";
import { initGeoLocation } from "./geolocation.js";

// temporary will be replaced with real auth
let params = new URLSearchParams(document.location.search);
export const auth = params.get("key");

export const tileLayer = new TileLayer({
  source: new OSM({
    url: "https://tile.openstreetmap.de/{z}/{x}/{y}.png",
  }),
});

export const view = new View({
  minZoom: 14,
});

export const menuControl = new MenuControl();

export const map = new Map({
  target: "map",
  layers: [tileLayer],
  view: view,
  controls: defaultControls().extend([menuControl]),
});

export const vectorSource = new VectorSource();
new VectorLayer({
  map: map,
  source: vectorSource,
});

export const geolocation = initGeoLocation(map);

fetchData();
