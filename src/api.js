import { loadData } from "./loader";

const baseURL = import.meta.env.PROD
  ? "https://sl.derfarmer.net/"
  : "http://localhost:1323/";

export async function fetchData(reload = false) {
  const res = await fetch(baseURL + "features");

  if (!res.ok) throw new Error("Failed to load lamps.etmsl: " + res.status);

  const data = await res.arrayBuffer();

  loadData(data, reload);
}

export async function saveFeature(index, feature) {
  console.warn("Feature object:", feature, " at index:", index);

  const res = await fetch(baseURL + "edit/" + index, {
    body: JSON.stringify(feature),
    headers: {
      "content-type": "application/json",
    },
    method: "PUT",
  });

  if (!res.ok) throw new Error("Failed to save feature: " + res.status);

  const data = await res.arrayBuffer();

  loadData(data, true);
}
