import {
  getSetting,
  SETTING_DISPLAY_FILTER,
  SETTING_DISPLAY_TYPE,
  SETTINGS_ICON_SIZE,
} from "./settings";
import { openSidebar } from "./utils";
import { auth } from "./main";
import { addFeatureListener, addReportListener } from "./listener";

const sidebar = document.getElementById("sidebar-inner");

export function handleHTML(index, feature) {
  if (auth == null) {
    sidebar.innerHTML = htmlUser();
    addReportListener(index, feature);
  } else {
    sidebar.innerHTML = htmlAdmin(feature);
    addFeatureListener(index, feature);
  }

  openSidebar();
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

 <div style="margin-bottom:8px">
      <label style="font-size:13px; display:block; margin-bottom:4px">Status</label>
      <select id="status-type-select">
        ${statusTypes
          .map((o) => {
            return `<option value="${o.v}" ${feature.status == o.v ? "selected" : ""}>${o.t}</option>`;
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
      <button id="use-map-btn" type="button" style="flex:1">Nutze Karte</button>
    </div>

    <div style="font-size:13px;>
      <label style="display:block; margin-bottom:4px">Art</label>
      <div style="display: flex;margin-bottom:8px">
        <div style="display:flex; align-items: center;">
          <input id="feature-type-lamp" type="radio" ${feature.featureType == 0 ? "checked" : ""} value="lamp" name="feature-type" style="width:100%; box-sizing:border-box"/>
          <label for="feature-type-lamp">Leuchte</label>
        </div>
        <div style="display:flex; align-items: center;">
          <input id="feature-type-dbox" type="radio" ${feature.featureType == 1 ? "checked" : ""} name="feature-type" value="dbox" style="width:100%; box-sizing:border-box"/>
          <label for="feature-type-dbox">Verteiler</label>
        </div>
      </div>
    </div>

    <div style="margin-bottom:10px">
      <label style="font-size:13px; display:block; margin-bottom:4px">Verteiler</label>
      <input id="connection-input" type="number" value="${feature.connection || 0}" style="width:100%; padding:6px; box-sizing:border-box"/>
    </div>

    <hr/>

    <div style="display:flex; gap:8px; justify-content:flex-start">
      <button id="save-btn" type="button" style="padding:8px 12px">Speichern</button>
      <button id="preview-btn" type="button" style="padding:8px 12px">Vorschau</button>
      <button id="remove-btn" type="button" style="padding:8px 12px;color:red">Entfernen</button>
    </div>
  `;
}

export function htmlMenu() {
  const displaySetting = getSetting(SETTING_DISPLAY_TYPE);
  const displayFilter = getSetting(SETTING_DISPLAY_FILTER);
  const iconSize = getSetting(SETTINGS_ICON_SIZE);

  return `
    <div style="margin-bottom:8px">
      <strong>Menu</strong><br/>
    </div>
    <hr/>

    <div style="margin-bottom:8px">
      <label style="font-size:13px; display:block; margin-bottom:4px">Farb Anzeige Typ</label>
      <select id="displayTyp">
        ${displayTypes
          .map((o) => {
            return `<option value="${o.v}" ${displaySetting == o.v ? "selected" : ""}>${o.t}</option>`;
          })
          .join("\n")}
      </select>
    </div>

    <div style="margin-bottom:8px">
      <label style="font-size:13px; display:block; margin-bottom:4px">Anzeigefilter</label>
      <select id="displayFilter">
        ${displayFilters
          .map((o) => {
            return `<option value="${o.v}" ${displayFilter == o.v ? "selected" : ""}>${o.t}</option>`;
          })
          .join("\n")}
      </select>
    </div>

    <div style="margin-bottom:8px">
      <label style="font-size:13px; display:block; margin-bottom:4px">Anzeigefilter</label>
      <select id="iconSize">
        ${iconSizeTypes
          .map((o) => {
            return `<option value="${o.v}" ${iconSize == o.v ? "selected" : ""}>${o.t}</option>`;
          })
          .join("\n")}
      </select>
    </div>

    <hr/>

    <button id="add-btn" type="button" style="padding:8px 12px">Hinzufügen</button>
  `;
}

const iconSizeTypes = [
  { v: "dynamic", t: "Dynamisch" },
  { v: "static", t: "Statisch" },
];

const displayFilters = [
  { v: "all", t: "Leuchten & Verteiler" },
  { v: "lamps", t: "Nur Leuchten" },
  { v: "dboxs", t: "Nur Verteiler" },
];

const displayTypes = [
  { v: "lampType", t: "Lichtquelle" },
  { v: "connection", t: "Verteiler" },
  { v: "status", t: "Status" },
];

const statusTypes = [
  { v: 0, t: "Nicht Gemeldet" },
  { v: 1, t: "Ausgeschaltet" },
  { v: 2, t: "Gemeldet" },
];

const lampTypes = [
  { v: 0, t: "(unbekannt)" },
  { v: 1, t: "LED" },
  { v: 2, t: "Natriumdampf-Hochdruck" },
  { v: 16, t: "Andere" },
];
