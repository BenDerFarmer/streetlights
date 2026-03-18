import "./style.css";
import Map from "ol/Map.js";
import View from "ol/View.js";
import OSM from "ol/source/OSM.js";
import TileLayer from "ol/layer/Tile.js";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat } from "ol/proj.js";
import { Overlay } from "ol";
import { fetchData } from "./api.js";
import { addPopupListener, buildPopupContent } from "./popup.js";

export const tileLayer = new TileLayer({
  source: new OSM({
    url: "https://tile.openstreetmap.de/{z}/{x}/{y}.png",
  }),
});

export const view = new View({
  center: fromLonLat([0, 20]),
  minZoom: 14,
});

export const map = new Map({
  target: "map",
  layers: [tileLayer],
  view: view,
});

export const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vectorSource,
});
map.addLayer(vectorLayer);

const popupEl = document.getElementById("popup");
const popupOverlay = new Overlay({
  element: popupEl,
  autoPan: true,
  autoPanAnimation: { duration: 250 },
});
map.addOverlay(popupOverlay);

const popupClose = popupEl?.querySelector(".popup-close");
if (popupClose) {
  popupClose.addEventListener("click", () =>
    popupOverlay.setPosition(undefined),
  );
}

map.on("singleclick", (evt) => {
  const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
  if (!feature) {
    popupOverlay.setPosition(undefined);
    return;
  }
  const geom = feature.getGeometry();
  const coords = geom.getCoordinates();

  const meta = feature.get("meta") || {};
  const index = feature.get("index");

  popupEl.querySelector(".popup-content").innerHTML = "Loading...";
  popupOverlay.setPosition(coords);

  const popupContent = buildPopupContent(meta, feature, index);
  popupEl.querySelector(".popup-content").innerHTML = popupContent;

  addPopupListener(popupEl, feature, popupOverlay, index);
});

let params = new URLSearchParams(document.location.search);
export const auth = params.get("key");

fetchData();
