map.on("singleclick", (evt) => {
  const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
  if (!feature) {
    popupOverlay.setPosition(undefined);
    return;
  }
  const geom = feature.getGeometry();
  const coords = geom.getCoordinates();

  const meta = feature.get("meta") || {};
  const index = feature.get("index");

  popupEl.querySelector(".popup-content").innerHTML = "Loading...";
  popupOverlay.setPosition(coords);

  const popupContent = buildPopupContent(meta, feature, index);
  popupEl.querySelector(".popup-content").innerHTML = popupContent;

  addPopupListener(popupEl, feature, popupOverlay, index);
});
