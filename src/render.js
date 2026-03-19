import Style from "ol/style/Style.js";
import Icon from "ol/style/Icon.js";

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

export function createLightStyle(lampType) {
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="10" fill="${getLampColor(lampType)}" stroke="#333" stroke-width="1"/>
    </svg>
  `);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${svg}`;

  return new Style({
    image: new Icon({
      src: dataUrl,
      anchor: [0.5, 1], // anchor at bottom-center (pixels or fraction)
      anchorXUnits: "fraction",
      anchorYUnits: "fraction",
      scale: 1,
      crossOrigin: "anonymous",
    }),
  });
}
