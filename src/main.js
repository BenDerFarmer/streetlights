import "./style.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const map = L.map("map", {
  minZoom: 14,
}).setView([20, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

fetch("/data.geojson")
  .then((response) => response.json())
  .then((data) => {
    parseData(data);
  })
  .catch((error) => {
    console.error("Error loading GeoJSON:", error);
  });

function getLampFilter(type) {
  switch (type) {
    case "led":
      return "brightness(1.2) sepia(1) hue-rotate(180deg) saturate(3)";
      break;
    case "high_pressure_sodium":
      return "sepia(100%) saturate(1500%) hue-rotate(-40deg) brightness(95%);";
      break;
    default:
      return "sepia(100%) saturate(1000%) hue-rotate(0deg) brightness(90%);";
  }
}

function parseData(data) {
  const geojsonLayer = L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
      const lampType = feature.properties?.lamp_type;
      const filter = getLampFilter(lampType);

      const icon = L.divIcon({
        className: "",
        html: `
            <img 
              src="/light.png" 
              style="
                width: 24px;
                height: 24px;
                filter: ${filter};
                drop-shadow(0 0 6px currentColor);
              "
            />
          `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      return L.marker(latlng, { icon });
    },
  });

  const bounds = geojsonLayer.getBounds();

  geojsonLayer.addTo(map);
  map.setMaxBounds(bounds);
  map.fitBounds(bounds);
}
