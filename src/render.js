import Style from "ol/style/Style.js";
import Icon from "ol/style/Icon.js";
import {
  getSetting,
  SETTING_DISPLAY_TYPE,
  SETTINGS_ICON_SIZE,
} from "./settings";
import { get as getProjection } from "ol/proj";

function getLampColor(type) {
  switch (type) {
    case 1:
      return "#92efe9";
    case 2:
      return "#f2862e";
    default:
      return "#fff316";
  }
}

function getStatusColor(status) {
  switch (status) {
    case 1:
      return "#000000";
    case 2:
      return "#d22d2d";
    default:
      return "#fff316";
  }
}

export function createLightStyle(feature) {
  let color;
  const displaySetting = getSetting(SETTING_DISPLAY_TYPE);
  if (displaySetting == "connection") {
    color = intToHslColor(feature.connection);
  } else if (displaySetting == "status") {
    color = getStatusColor(feature.status);
  } else {
    color = getLampColor(feature.lampType);
  }

  return createStyle(
    `<circle cx="16" cy="16" r="10" fill="${color}" stroke="#333" stroke-width="1"/>`,
  );
}

export function createDBoxStyle(feature) {
  let color = intToHslColor(feature.connection);

  return createStyle(
    `<rect width="16" height="16" fill="${color}" stroke="#333" stroke-width="1"/>`,
  );
}

const pxTemplateSize = 32; // matches SVG width/height
const desiredMeters = 5; // desired size on map in meters

export function createStyle(svgbody) {
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${pxTemplateSize}" height="${pxTemplateSize}" viewBox="0 0 ${pxTemplateSize} ${pxTemplateSize}">
      ${svgbody}
    </svg>
  `);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${svg}`;

  const icon = new Icon({
    src: dataUrl,
    anchor: [0.5, 1],
    anchorXUnits: "fraction",
    anchorYUnits: "fraction",
    scale: 1,
    crossOrigin: "anonymous",
  });

  const style = new Style({ image: icon });

  if (getSetting(SETTINGS_ICON_SIZE) == "static") return style;

  const metersPerUnit = getProjection("EPSG:3857").getMetersPerUnit();
  const desiredMapUnits = desiredMeters / metersPerUnit;

  return (_, resolution) => {
    // resolution is map units per pixel
    let desiredPx = desiredMapUnits / resolution;
    desiredPx = Math.max(4, Math.min(128, desiredPx));
    const scale = desiredPx / pxTemplateSize;
    icon.setScale(scale);
    return style;
  };
}

function intToHslColor(n, s = 65, l = 50) {
  const hue = Math.imul(n >>> 0, 2246822507) >>> 0;
  return `hsl(${hue % 360}, ${s}%, ${l}%)`;
}
