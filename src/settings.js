const settings = {};

const SETTING_PREFIX = "setting_";

export const SETTING_DISPLAY_TYPE = "displayType";
export const SETTING_DISPLAY_FILTER = "displayFilter";
export const SETTINGS_ICON_SIZE = "iconSize";

export function loadSettings() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (!key.startsWith(SETTING_PREFIX)) continue;

    const keyName = key.split(SETTING_PREFIX)[1];

    settings[keyName] = localStorage.getItem(key);
  }
}

export function getSetting(key) {
  return settings[key];
}

export function setSettings(key, value) {
  settings[key] = value;
  localStorage.setItem(SETTING_PREFIX + key, value);
}
