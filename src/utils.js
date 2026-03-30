export function logError(msg) {
  console.error(msg);
  alert(msg);
}

const sidebar = document.getElementById("sidebar");
export function openSidebar() {
  sidebar.className = "open";
}

export function closeSidebar() {
  sidebar.className = "";
}
