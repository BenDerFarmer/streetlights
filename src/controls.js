import Control from "ol/control/Control.js";
import { auth } from "./main";
import { geolocation } from "./main";
import { htmlMenu } from "./sidebar";
import { addMenuListener } from "./listener";
import { openSidebar } from "./utils";

export class MenuControl extends Control {
  constructor(opt_options) {
    const options = opt_options || {};

    const element = document.createElement("div");
    element.className = "ol-control menu";

    super({
      element: element,
      target: options.target,
    });

    if (auth != null) {
      const addBtn = document.createElement("button");
      addBtn.innerHTML = svgSettings();

      element.appendChild(addBtn);
      addBtn.addEventListener("click", this.handleMenu.bind(this), false);
    }

    const gpsBtn = document.createElement("button");
    gpsBtn.innerHTML = svgPosition();

    element.appendChild(gpsBtn);
    gpsBtn.addEventListener("click", this.handleGPS.bind(this), false);
  }

  isGPSActive = false;
  isGPSFirstLoad = true;

  handleGPS() {
    this.isGPSActive = !this.isGPSActive;
    geolocation.setTracking(this.isGPSActive);
    if (this.isGPSActive) this.isGPSFirstLoad = true;
  }

  handleMenu() {
    const sidebar = document.getElementById("sidebar-inner");

    sidebar.innerHTML = htmlMenu();
    addMenuListener(sidebar);
    openSidebar();
  }
}

function svgPosition() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3a5ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-locate-fixed-icon lucide-locate-fixed"><line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/></svg>
`;
}

function svgSettings() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings-icon lucide-settings"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>
`;
}
