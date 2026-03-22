import { loadData } from "./loader";
import { logError } from "./utils";

const baseURL = import.meta.env.PROD
  ? "https://sl.derfarmer.net/"
  : "http://localhost:1323/";

export async function fetchData(reload = false) {
  await baseRequest("features", {}, "Failed to load Features", reload);
}

export async function saveFeature(index, feature) {
  await baseRequest(
    "edit/" + index,
    {
      body: JSON.stringify(feature),
      headers: {
        "content-type": "application/json",
      },
      method: "PUT",
    },
    "Failed to save feature",
    true,
  );
}

export async function createFeature(feature) {
  await baseRequest(
    "create",
    {
      body: JSON.stringify(feature),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    },
    "Failed to create feature",
    true,
  );
}

export async function deleteFeature(index) {
  await baseRequest(
    "delete/" + index,
    {
      headers: {
        "content-type": "application/json",
      },
      method: "DELETE",
    },
    "Failed to delete feature",
    true,
  );
}

async function baseRequest(fetchURL, fetchOpt, errorMsg, reload) {
  const res = await fetch(baseURL + fetchURL, fetchOpt);

  if (!res.ok) logError(errorMsg + ": " + res.status);

  const data = await res.arrayBuffer();

  loadData(data, reload);
}
