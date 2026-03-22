import { Fill, Stroke, Style } from "ol/style.js";
import CircleStyle from "ol/style/Circle.js";
import { Point } from "ol/geom.js";
import Geolocation from "ol/Geolocation.js";
import { Feature } from "ol";
import { logError } from "./utils";
import { menuControl } from "./main";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

export function initGeoLocation(map) {
  const geolocation = new Geolocation({
    trackingOptions: {
      enableHighAccuracy: true,
    },
    projection: map.getView().getProjection(),
  });

  geolocation.on("error", function (error) {
    logError(error);
  });

  const accuracyFeature = new Feature();
  geolocation.on("change:accuracyGeometry", function () {
    accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
  });

  const positionFeature = new Feature();
  positionFeature.setStyle(
    new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({
          color: "#3399CC",
        }),
        stroke: new Stroke({
          color: "#fff",
          width: 2,
        }),
      }),
    }),
  );

  geolocation.on("change:position", function () {
    const coordinates = geolocation.getPosition();
    positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);

    if (menuControl.isGPSFirstLoad) {
      map.getView().animate({ center: geolocation.getPosition(), zoom: 16 });
      menuControl.isGPSFirstLoad = false;
    }
  });

  new VectorLayer({
    map: map,
    source: new VectorSource({
      features: [accuracyFeature, positionFeature],
    }),
  });

  return geolocation;
}
