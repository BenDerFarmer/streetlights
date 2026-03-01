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

export function createLightIcon(lampType, size = 32) {
  const color = getLampColor(lampType);
  const html = `
  <svg xmlns="http://www.w3.org/2000/svg" width=${size} height=${size} class="glow" viewBox="0 0 ${size} ${size}" fill="none" 
     stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="4" fill="${color}"/>
  </svg>
  `;
  return L.divIcon({
    className: "",
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
