import { map, vectorSource } from "./main";
import View from "ol/View.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import { fromLonLat } from "ol/proj.js";
import { createLightStyle } from "./render";

export function loadData(data, reload = false) {
  const out = parseETMSL(data);
  if (reload) {
    vectorSource.clear();
  }

  const features = [];
  for (let i = 0; i < out.features.length; i++) {
    const f = out.features[i];

    const pt = new Point(fromLonLat(f.coordinates));

    const olFeature = new Feature({
      geometry: pt,
    });

    olFeature.set("meta", f);
    olFeature.set("index", i);

    olFeature.setStyle(createLightStyle(f.lampType));

    features.push(olFeature);
  }

  vectorSource.addFeatures(features);

  if (!reload) {
    const extent = vectorSource.getExtent();
    if (extent && !isNaN(extent[0])) {
      map.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        size: map.getSize(),
      });

      const view = map.getView();
      const center = view.getCenter();
      const zoom = view.getZoom();

      map.setView(
        new View({
          center,
          zoom,
          extent,
        }),
      );
    }
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
