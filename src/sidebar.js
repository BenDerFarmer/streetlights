import { auth } from "./main";

const sidebar = document.getElementById("sidebar-inner");

export function setupSideBar(map) {
  map.on("singleclick", (evt) => {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
    if (!feature) {
      return;
    }

    const meta = feature.get("meta") || {};
    const index = feature.get("index");

    sidebar.innerHTML = auth != null ? htmlAdmin(meta) : htmlUser();
  });
}

function htmlUser() {
  return `
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
  `;
}

function htmlAdmin(feature) {
  const [lng, lat] = feature.coordinates || [0, 0];

  return `
   <div style="margin-bottom:8px">
      <strong>Admin</strong><br/>
    </div>
    <hr>
    <div style="margin-bottom:8px">
      <label style="font-size:13px; display:block; margin-bottom:4px">Leuchtmittel</label>
      <select id="lamp-type-select">
        ${lampTypes
          .map((o) => {
            return `<option value="${o.v}" ${feature.lampType == o.v ? "selected" : ""}>${o.t}</option>`;
          })
          .join("\n")}
      </select>
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

const lampTypes = [
  { v: 0, t: "(unbekannt)" },
  { v: 1, t: "LED" },
  { v: 2, t: "Natriumdampf-Hochdruck" },
  { v: 16, t: "Andere" },
];
