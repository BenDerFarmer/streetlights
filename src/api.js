import { loadData } from "./loader";

export async function saveFeature(index, feature) {
  console.warn("Feature object:", feature, " at index:", index);

  const res = await fetch("http://localhost:1323/edit/" + index, {
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
