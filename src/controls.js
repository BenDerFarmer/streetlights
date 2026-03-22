import Control from "ol/control/Control.js";
import { auth } from "./main";
import { geolocation } from "./main";

export class MenuControl extends Control {
  constructor(opt_options) {
    const options = opt_options || {};

    const element = document.createElement("div");
    element.className = "menu ol-unselectable ol-control";

    super({
      element: element,
      target: options.target,
    });

    const gpsBtn = document.createElement("button");
    gpsBtn.innerHTML = "o";

    element.appendChild(gpsBtn);
    gpsBtn.addEventListener("click", this.handleGPS.bind(this), false);

    if (auth != null) {
      const addBtn = document.createElement("button");
      addBtn.innerHTML = "+";

      element.appendChild(addBtn);
      addBtn.addEventListener("click", this.handleAdd.bind(this), false);
    }
  }

  isGPSActive = false;
  isGPSFirstLoad = true;

  handleGPS() {
    this.isGPSActive = !this.isGPSActive;
    geolocation.setTracking(this.isGPSActive);
    if (this.isGPSActive) this.isGPSFirstLoad = true;
  }

  handleAdd() {
    console.log("add");
  }
}
