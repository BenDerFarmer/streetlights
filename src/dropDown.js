import { map, createLightIcon } from "./main.js";
import { saveFeature } from "./api.js";

export function buildPopupContent(feature, marker) {
  const container = document.createElement("div");
  container.style.minWidth = "260px";
  container.style.maxWidth = "420px";
  container.style.fontFamily =
    'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial';

  container.innerHTML = `
    <div style="margin-bottom:8px">
      <strong>Straßenbeleuchtung</strong><br/>
    </div>

    <div style="margin-bottom:8px">
      <label style="font-size:13px; display:block; margin-bottom:4px">Melde ein Problem</label>
      <textarea id="report-text" rows="3" placeholder="Beschreib das Problem..." style="width:100%; box-sizing:border-box; padding:6px"></textarea>
      <div style="margin-top:6px; display:flex; gap:6px">
        <button class="tpl-btn" data-tpl="Dauerhaft aus" type="button" style="flex:1">Dauerhaft aus</button>
        <button class="tpl-btn" data-tpl="Flackert" type="button" style="flex:1">Flackert</button>
        <button class="tpl-btn" data-tpl="Mast beschädigt" type="button" style="flex:1">Mast beschädigt</button>
      </div>
    </div>
    ${window.isLoggedIn ? adminPopup(container, feature, marker) : ""}
  `;

  if (window.isLoggedIn) adminLogic(container, feature, marker);

  return container;
}

function adminPopup(container, feature, marker) {
  const props = feature.properties || {};

  const [lng0, lat0] = (feature.geometry && feature.geometry.coordinates) || [
    0, 0,
  ];

  return `
   <div style="margin-bottom:8px">
      <strong>Admin</strong><br/>
    </div>
    <hr>
    <div style="margin-bottom:8px">
      <label style="font-size:13px; display:block; margin-bottom:4px">Leuchtmittel</label>
      <div id="lamp-type-wrapper"></div>
    </div>

    <div style="margin-bottom:8px; display:flex; gap:6px; align-items:flex-end">
      <div style="flex:1">
        <label style="font-size:13px; display:block; margin-bottom:4px">Breitengrad</label>
        <input id="lat-input" type="number" step="0.000001" value="${lat0 ?? ""}" style="width:100%; padding:6px; box-sizing:border-box"/>
      </div>
      <div style="flex:1">
        <label style="font-size:13px; display:block; margin-bottom:4px">Längengrad</label>
        <input id="lng-input" type="number" step="0.000001" value="${lng0 ?? ""}" style="width:100%; padding:6px; box-sizing:border-box"/>
      </div>
    </div>
    <div style="display:flex; gap:6px; margin-bottom:8px">
      <button id="use-gps-btn" type="button" style="flex:1">Nutze Standort</button>
      <button id="set-marker-btn" type="button" style="flex:1">Vorschau</button>
    </div>

    <div style="margin-bottom:10px">
      <label style="font-size:13px; display:block; margin-bottom:4px">Verteiler</label>
      <input id="dbbox-input" type="text" value="${(props.dbbox || "").replace(/"/g, "&quot;")}" style="width:100%; padding:6px; box-sizing:border-box"/>
    </div>

    <div style="display:flex; gap:8px; justify-content:flex-end">
      <button id="save-btn" type="button" style="padding:8px 12px">Speichern</button>
      <button id="close-btn" type="button" style="padding:8px 12px">Abrechen</button>
    </div>
  `;
}

function adminLogic(container, feature, marker) {
  const props = feature.properties || {};

  const [lng0, lat0] = (feature.geometry && feature.geometry.coordinates) || [
    0, 0,
  ];

  const lampTypeWrapper = container.querySelector("#lamp-type-wrapper");
  if (window.isLoggedIn) {
    const select = document.createElement("select");
    select.id = "lamp-type-select";
    select.style.width = "99%";
    select.style.padding = "5px";
    const options = [
      { v: "", t: "(unbekannt)" },
      { v: "led", t: "LED" },
      { v: "high_pressure_sodium", t: "Natriumdampf-Hochdruck" },
      { v: "other", t: "Andere" },
    ];
    options.forEach((o) => {
      const opt = document.createElement("option");
      opt.value = o.v;
      opt.text = o.t;
      if ((props.lamp_type || "").toLowerCase() === o.v) opt.selected = true;
      select.appendChild(opt);
    });
    lampTypeWrapper.appendChild(select);
  } else {
    const span = document.createElement("span");
    span.textContent = props.lamp_type || "(not specified)";
    span.style.color = "#221";
    lampTypeWrapper.appendChild(span);
  }

  const tplButtons = container.querySelectorAll(".tpl-btn");
  tplButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tpl = btn.getAttribute("data-tpl");
      const ta = container.querySelector("#report-text");
      if (ta.value && ta.value.trim().length)
        ta.value = ta.value.trim() + "; " + tpl;
      else ta.value = tpl;
    });
  });

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

  const setMarkerBtn = container.querySelector("#set-marker-btn");
  setMarkerBtn.addEventListener("click", () => {
    const lat = parseFloat(container.querySelector("#lat-input").value);
    const lng = parseFloat(container.querySelector("#lng-input").value);
    if (!isFinite(lat) || !isFinite(lng)) {
      alert("Bitte gib einen richtigen Längengrad und Breitengrad an");
      return;
    }
    const newLatLng = L.latLng(lat, lng);
    marker.setLatLng(newLatLng);
    map.panTo(newLatLng);
  });

  const closeBtn = container.querySelector("#close-btn");
  closeBtn.addEventListener("click", () => {
    marker.closePopup();
  });

  const saveBtn = container.querySelector("#save-btn");
  saveBtn.addEventListener("click", () => {
    // collect data
    const reportText = container.querySelector("#report-text").value.trim();
    const dbboxVal = container.querySelector("#dbbox-input").value.trim();
    const lat = parseFloat(container.querySelector("#lat-input").value);
    const lng = parseFloat(container.querySelector("#lng-input").value);

    if (!feature.properties) feature.properties = {};
    feature.properties.dbbox = dbboxVal;

    const selectEl = container.querySelector("#lamp-type-select");
    if (selectEl) {
      feature.properties.lamp_type = selectEl.value || null;
    }

    if (reportText) {
      if (!feature.properties.reports) feature.properties.reports = [];
      feature.properties.reports.push({
        text: reportText,
        when: new Date().toISOString(),
      });
    }

    if (isFinite(lat) && isFinite(lng)) {
      feature.geometry = feature.geometry || {
        type: "Point",
        coordinates: [lng, lat],
      };
      feature.geometry.coordinates = [lng, lat];
      marker.setLatLng([lat, lng]);
    }

    const newType = feature.properties.lamp_type;
    marker.setIcon(createLightIcon(newType));

    marker.closePopup();

    saveFeature(feature);
  });
}
