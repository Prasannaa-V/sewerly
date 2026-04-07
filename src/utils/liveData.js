const defaultBridgeUrl = 'http://localhost:3001';

export const bridgeApiBase = (
  import.meta.env.VITE_SENSOR_API_BASE || defaultBridgeUrl
).replace(/\/$/, '');

const fetchJson = async (path) => {
  const response = await fetch(`${bridgeApiBase}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};

export const fetchBridgeHealth = () => fetchJson('/health');

export const fetchLatestSensorSnapshot = () => fetchJson('/api/sensor/latest');

export const fetchSensorHistory = (limit = 20) =>
  fetchJson(`/api/sensor/history?limit=${limit}`);
