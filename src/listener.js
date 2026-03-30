import { createFeature, deleteFeature, saveFeature } from "./api";
import { pushFeatureAndLoad, reloadFeatures } from "./loader";
import { map } from "./main";
import {
  SETTINGS_ICON_SIZE,
  SETTING_DISPLAY_FILTER,
  SETTING_DISPLAY_TYPE,
  setSettings,
} from "./settings";
import { handleHTML } from "./sidebar";
import { fromLonLat, toLonLat } from "ol/proj";
import { closeSidebar, logError } from "./utils";

let useMap = false;

export function addMapListener(map) {
  map.on("singleclick", (evt) => {
    if (useMap) {
      const lonLat = toLonLat(evt.coordinate);
      document.querySelector("#lng-input").value = lonLat[0].toFixed(5);
      document.querySelector("#lat-input").value = lonLat[1].toFixed(5);
      return;
    }

    const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
    if (!feature) {
      return;
    }

    const index = feature.get("index");
    const meta = feature.get("meta") || {};

    handleHTML(index, meta);
  });

  const closeSidebarBtn = document.getElementById("close-btn");
  closeSidebarBtn.addEventListener("click", () => {
    closeSidebar();
    useMap = false;
  });
}

export function addMenuListener(sidebar) {
  const displayTypSelect = sidebar.querySelector("#displayTyp");

  displayTypSelect.addEventListener("input", (event) => {
    setSettings(SETTING_DISPLAY_TYPE, event.target.value);
    reloadFeatures();
  });

  const displayFilterSelect = sidebar.querySelector("#displayFilter");

  displayFilterSelect.addEventListener("input", (event) => {
    setSettings(SETTING_DISPLAY_FILTER, event.target.value);
    reloadFeatures();
  });

  const iconSizeSelect = sidebar.querySelector("#iconSize");

  iconSizeSelect.addEventListener("input", (event) => {
    setSettings(SETTINGS_ICON_SIZE, event.target.value);
    reloadFeatures();
  });

  const addBtn = sidebar.querySelector("#add-btn");
  addBtn.addEventListener("click", () => {
    const feature = {
      featureType: 0,
      status: 0,
      lampType: 0,
      connection: 0,
      coordinates: [0, 0],
    };
    handleHTML(-1, feature);
  });
}

export function addFeatureListener(index, feature) {
  const container = document.getElementById("sidebar-inner");

  const useGpsBtn = container.querySelector("#use-gps-btn");
  useGpsBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Standortauswahl wird vor deinen Browser nicht unterstützt.");
      return;
    }
    useGpsBtn.disabled = true;
    useGpsBtn.textContent = "rufe ab...";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        container.querySelector("#lat-input").value = latitude.toFixed(5);
        container.querySelector("#lng-input").value = longitude.toFixed(5);
        useGpsBtn.disabled = false;
        useGpsBtn.textContent = "Nutze Standort";
      },
      (err) => {
        console.error(err);
        alert("Standort wurde nicht gefunden: " + (err.message || err.code));
        useGpsBtn.disabled = false;
        useGpsBtn.textContent = "Nutze Standort";
      },
      { enableHighAccuracy: true, timeout: 14999 },
    );
  });

  const mapBtn = container.querySelector("#use-map-btn");
  mapBtn.addEventListener("click", () => {
    if (!useMap) {
      useMap = true;
      mapBtn.textContent = "Kicke auf die Karte";
    } else {
      useMap = false;
      mapBtn.textContent = "Nutze Karte";
    }
  });

  const removeBtn = container.querySelector("#remove-btn");
  removeBtn.addEventListener("click", () => {
    deleteFeature(index);
    closeSidebar();
  });

  function collectData() {
    const connection = container.querySelector("#connection-input").value;
    const lat = parseFloat(container.querySelector("#lat-input").value);
    const lng = parseFloat(container.querySelector("#lng-input").value);

    if (!isFinite(lat) || !isFinite(lng)) {
      logError("Bitte gib einen richtigen Längengrad und Breitengrad an");
      return;
    }

    feature.coordinates = [lng, lat];

    feature.connection = parseInt(connection);

    const lampTypeEl = container.querySelector("#lamp-type-select");
    if (lampTypeEl) {
      feature.lampType = parseInt(lampTypeEl.value || 0);
    }

    const statusEl = container.querySelector("#status-type-select");
    if (statusEl) {
      feature.status = parseInt(statusEl.value || 0);
    }

    const featureTypeEl = container.querySelector("#feature-type-dbox");
    if (featureTypeEl && featureTypeEl.checked) {
      feature.featureType = 1;
    } else {
      feature.featureType = 0;
    }

    map.getView().animate({
      center: fromLonLat(feature.coordinates),
      duration: 200,
    });

    return feature;
  }

  const preViewBtn = container.querySelector("#preview-btn");
  preViewBtn.addEventListener("click", () => {
    const feature = collectData();

    pushFeatureAndLoad(feature);
  });

  const saveBtn = container.querySelector("#save-btn");
  saveBtn.addEventListener("click", () => {
    const feature = collectData();

    if (index == -1) {
      createFeature(feature);
    } else {
      saveFeature(index, feature);
    }
  });
}

export function addReportListener(index, feature) {}
