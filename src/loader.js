import { map, tileLayer } from "./main";
import { buildPopupContent } from "./dropDown.js";
import { createLightIcon } from "./render.js";

export function loadData(data, reload = false) {
  const out = parseETMSL(data);

  if (reload) {
    map.eachLayer((layer) => {
      if (layer != tileLayer) layer.removeFrom(map);
    });
  }

  const markers = [];
  for (let i = 0; i < out.features.length; i++) {
    const feature = out.features[i];

    const marker = L.marker(feature.coordinates, {
      icon: createLightIcon(feature.lampType),
    });

    marker.on("popupopen", () => {
      const popupContent = buildPopupContent(feature, marker, i);
      marker.getPopup().setContent(popupContent);
    });

    marker.bindPopup("Loading...");

    markers.push(marker);
  }

  const layer = L.featureGroup(markers).addTo(map);

  if (!reload) {
    const bounds = layer.getBounds().pad(0.1);
    map.setMaxBounds(bounds);
    map.fitBounds(bounds);
  }
}

function parseETMSL(buffer) {
  const dv = new DataView(buffer);
  let off = 0;
  const readBytes = (n) => {
    const b = new Uint8Array(buffer, off, n);
    off += n;
    return b;
  };

  // Read magic "ETMSL" (5 bytes)
  const magic = String.fromCharCode(...readBytes(5));
  if (magic !== "ETMSL") throw new Error("Invalid magic: " + magic);

  // user/admin byte
  const userType = dv.getUint8(off);
  off += 1;

  const features = [];
  const total = dv.byteLength;

  while (off + 1 + 1 + 4 + 4 <= total) {
    // packed featureType/status
    const packed1 = dv.getUint8(off);
    off += 1;
    // packed lampType/connection
    const packed2 = dv.getUint8(off);
    off += 1;

    const featureType = (packed1 >> 4) & 0x0f;
    const status = packed1 & 0x0f;
    const lampType = packed2 & 0x0f;
    const connection = (packed2 >> 4) & 0x0f;

    const lat = dv.getFloat32(off, false);
    off += 4;
    const lng = dv.getFloat32(off, false);
    off += 4;

    features.push({
      featureType, // 0=lamp,1=dbox,2=transformer
      status, // 0=not reported,1=intentionally off,2=reported
      lampType, // 0=unknown,1=led,2=high_pressure_sodium,16=other (may exceed 4-bit)
      connection, // id packed (0..255 in Go), but here assumed 4-bit; see note below
      coordinates: [lat, lng],
    });
  }

  return { userType, features };
}
