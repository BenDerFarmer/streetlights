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
    <h2>Straßenlampe</h2>
    <div class="form-group">
      <label for="report-text">Melde ein Problem</label>
      <textarea id="report-text" rows="3" placeholder="Beschreibe das Problem..." class="input"></textarea>
    </div>
    <div class="flex-row">
      <button class="btn btn-secondary" data-tpl="Outage" type="button">Outage</button>
      <button class="btn btn-secondary" data-tpl="Flickering" type="button">Flickering</button>
      <button class="btn btn-secondary" data-tpl="Pole Damage" type="button">Pole Damage</button>
    </div>`;
}

function htmlAdmin(feature) {
  const [lng, lat] = feature.coordinates || [0, 0];
  return `
    <h2>Admin</h2>
    <hr/>
    <div class="form-group">
      <label for="lamp-type-select">Leuchtmittel</label>
      <select id="lamp-type-select" class="input">
        ${lampTypes.map((o) => `<option value="${o.v}"${feature.lampType == o.v ? " selected" : ""}>${o.t}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label for="status-type-select">Status</label>
      <select id="status-type-select" class="input">
        ${statusTypes.map((o) => `<option value="${o.v}"${feature.status == o.v ? " selected" : ""}>${o.t}</option>`).join("")}
      </select>
    </div>
    <div class="flex-row">
      <div class="form-group" style="flex:1">
        <label for="lat-input">Breitengrad</label>
        <input id="lat-input" type="number" step="0.000001" value="${lat}" class="input"/>
      </div>
      <div class="form-group" style="flex:1">
        <label for="lng-input">Längengrad</label>
        <input id="lng-input" type="number" step="0.000001" value="${lng}" class="input"/>
      </div>
    </div>
    <div class="flex-row form-group">
      <button id="use-gps-btn" type="button" class="btn btn-sm btn-secondary">Nutze GPS</button>
      <button id="use-map-btn" type="button" class="btn btn-sm btn-secondary">Nutze Map</button>
    </div>
    <div class="form-group">
      <label>Typ</label>
      <div class="flex-row">
        <label><input id="feature-type-lamp" type="radio" name="feature-type" value="lamp"${feature.featureType == 0 ? " checked" : ""}/>Leuchte</label>
        <label><input id="feature-type-dbox" type="radio" name="feature-type" value="dbox"${feature.featureType == 1 ? " checked" : ""}/>Verteiler</label>
      </div>
    </div>
    <div class="form-group">
      <label for="connection-input">Verbindung</label>
      <input id="connection-input" type="number" value="${feature.connection || 0}" class="input"/>
    </div>
    <hr/>
    <div class="flex-row">
      <button id="save-btn" type="button" class="btn btn-primary">Speichern</button>
      <button id="preview-btn" type="button" class="btn btn-secondary">Vorschau</button>
      <button id="remove-btn" type="button" class="btn btn-danger">Löschen</button>
    </div>`;
}

export function htmlMenu() {
  const displaySetting = getSetting(SETTING_DISPLAY_TYPE);
  const displayFilter = getSetting(SETTING_DISPLAY_FILTER);
  const iconSize = getSetting(SETTINGS_ICON_SIZE);
  return `
    <h2>Einstellungen</h2>
    <hr/>
    <div class="form-group">
      <label for="displayTyp">Farbanzeige Typ</label>
      <select id="displayTyp" class="input">
        ${displayTypes.map((o) => `<option value="${o.v}"${displaySetting == o.v ? " selected" : ""}>${o.t}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label for="displayFilter">Filter</label>
      <select id="displayFilter" class="input">
        ${displayFilters.map((o) => `<option value="${o.v}"${displayFilter == o.v ? " selected" : ""}>${o.t}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label for="iconSize">Symbol Größen</label>
      <select id="iconSize" class="input">
        ${iconSizeTypes.map((o) => `<option value="${o.v}"${iconSize == o.v ? " selected" : ""}>${o.t}</option>`).join("")}
      </select>
    </div>
    <hr/>
    <button id="add-btn" type="button" class="btn btn-primary btn-block">Neues Element hinzufügen</button>`;
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
