import { map, vectorSource } from "./main";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import { fromLonLat } from "ol/proj.js";
import { createDBoxStyle, createLightStyle } from "./render";
import { getSetting, SETTING_DISPLAY_FILTER } from "./settings";

let lastOut = null;

export function loadData(data, reload = false) {
  let out;
  if (data == null && lastOut != null) {
    out = lastOut;
  } else {
    out = parseETMSL(data);
    lastOut = out;
  }
  if (reload) {
    vectorSource.clear();
  }
  const features = [];
  for (let i = 0; i < out.features.length; i++) {
    const f = out.features[i];

    if (f.featureType == 0 && getSetting(SETTING_DISPLAY_FILTER) == "dboxs")
      continue;
    if (f.featureType == 1 && getSetting(SETTING_DISPLAY_FILTER) == "lamps")
      continue;

    const pt = new Point(fromLonLat(f.coordinates));

    const olFeature = new Feature({
      geometry: pt,
    });

    olFeature.set("meta", f);
    olFeature.set("index", i);

    if (f.featureType == 1) {
      olFeature.setStyle(createDBoxStyle(f));
    } else {
      olFeature.setStyle(createLightStyle(f));
    }

    features.push(olFeature);
  }

  vectorSource.addFeatures(features);

  if (reload) return;
  const e = vectorSource.getExtent();

  if (!e && isNaN(e[0])) return;

  map.getView().fit(e, {
    size: map.getSize(),
  });
}

export function reloadFeatures() {
  loadData(null, true);
}

export function pushFeatureAndLoad(feature) {
  lastOut.features.push(feature);
  reloadFeatures();
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

    const status = (packed1 >> 4) & 0x0f;
    const featureType = packed1 & 0x0f;
    const lampType = packed2 & 0x0f;
    const connection = (packed2 >> 4) & 0x0f;

    const lng = dv.getFloat32(off, false);
    off += 4;
    const lat = dv.getFloat32(off, false);
    off += 4;
    features.push({
      featureType, // 0=lamp,1=dbox,2=transformer
      status, // 0=not reported,1=intentionally off,2=reported
      lampType, // 0=unknown,1=led,2=high_pressure_sodium,16=other (may exceed 4-bit)
      connection, // id packed (0..255 in Go), but here assumed 4-bit; see note below
      coordinates: [lng, lat],
    });
  }

  return { userType, features };
}
