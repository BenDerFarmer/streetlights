import { map, auth, view } from "./main.js";
import { saveFeature } from "./api.js";
import { fromLonLat } from "ol/proj.js";

export function buildPopupContent(feature) {
  return `
  <div class="container">
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
    ${auth != null ? adminPopup(feature) : ""}
  </div>
  `;
}

function adminPopup(feature) {
  const [lng, lat] = feature.coordinates || [0, 0];

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
        <input id="lat-input" type="number" step="0.000001" value="${lat ?? ""}" style="width:100%; padding:6px; box-sizing:border-box"/>
      </div>
      <div style="flex:1">
        <label style="font-size:13px; display:block; margin-bottom:4px">Längengrad</label>
        <input id="lng-input" type="number" step="0.000001" value="${lng ?? ""}" style="width:100%; padding:6px; box-sizing:border-box"/>
      </div>
    </div>
    <div style="display:flex; gap:6px; margin-bottom:8px">
      <button id="use-gps-btn" type="button" style="flex:1">Nutze Standort</button>
      <button id="set-marker-btn" type="button" style="flex:1">Vorschau</button>
    </div>

    <div style="margin-bottom:10px">
      <label style="font-size:13px; display:block; margin-bottom:4px">Verteiler</label>
      <input id="dbbox-input" type="number" value="${feature.connection || 0}" style="width:100%; padding:6px; box-sizing:border-box"/>
    </div>

    <div style="display:flex; gap:8px; justify-content:flex-end">
      <button id="save-btn" type="button" style="padding:8px 12px">Speichern</button>
      <button id="close-btn" type="button" style="padding:8px 12px">Abrechen</button>
    </div>
  `;
}

export function addPopupListener(container, feature, overlay, index) {
  if (auth == null) return;

  const meta = feature.get("meta");

  const lampTypeWrapper = container.querySelector("#lamp-type-wrapper");
  const select = document.createElement("select");
  select.id = "lamp-type-select";
  select.style.width = "99%";
  select.style.padding = "5px";

  const options = [
    { v: 0, t: "(unbekannt)" },
    { v: 1, t: "LED" },
    { v: 2, t: "Natriumdampf-Hochdruck" },
    { v: 16, t: "Andere" },
  ];

  options.forEach((o) => {
    const opt = document.createElement("option");
    opt.value = o.v;
    opt.text = o.t;
    if (feature.get("meta").lampType === o.v) opt.selected = true;
    select.appendChild(opt);
  });
  lampTypeWrapper.appendChild(select);

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
    const newPos = [lng, lat];
    view.animate({
      center: fromLonLat(newPos),
      duration: 2000,
    });

    //@TODO Set the new pos on the map
  });

  const closeBtn = container.querySelector("#close-btn");
  closeBtn.addEventListener("click", () => {
    overlay.setPosition(undefined);
  });

  const saveBtn = container.querySelector("#save-btn");
  saveBtn.addEventListener("click", () => {
    // collect data
    const reportText = container.querySelector("#report-text").value.trim();
    const dbbox = container.querySelector("#dbbox-input").value;
    const lat = parseFloat(container.querySelector("#lat-input").value);
    const lng = parseFloat(container.querySelector("#lng-input").value);

    if (!isFinite(lat) || !isFinite(lng)) {
      alert("Bitte gib einen richtigen Längengrad und Breitengrad an");
      return;
    }

    meta.coordinates = [lng, lat];

    meta.connection = parseInt(dbbox);

    const selectEl = container.querySelector("#lamp-type-select");
    if (selectEl) {
      meta.lampType = parseInt(selectEl.value || 0);
    }

    saveFeature(index, meta);

    overlay.setPosition(undefined);
    view.animate({
      center: fromLonLat(meta.coordinates),
      duration: 2000,
    });
  });
}
