export const MANHOLE_DEPTH_CM = 100;

export const thresholds = {
  h2sWarning: 7,
  h2sDanger: 10,
  ch4Warning: 700,
  ch4Danger: 1000,
  waterLevelWarning: 35,
  waterLevelDanger: 50,
};

const DEFAULT_LOCATION = {
  id: 'MH-1023',
  lat: 12.9692,
  lng: 79.1559,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const randomInRange = (min, max) =>
  Math.round((Math.random() * (max - min) + min) * 100) / 100;

const getMetricStatus = (value, warningThreshold, dangerThreshold) => {
  if (value >= dangerThreshold) return 'danger';
  if (value >= warningThreshold) return 'warning';
  return 'safe';
};

const getOverallStatus = ({ h2s, ch4, waterLevel }) => {
  const statuses = [
    getMetricStatus(h2s, thresholds.h2sWarning, thresholds.h2sDanger),
    getMetricStatus(ch4, thresholds.ch4Warning, thresholds.ch4Danger),
    getMetricStatus(
      waterLevel,
      thresholds.waterLevelWarning,
      thresholds.waterLevelDanger
    ),
  ];

  if (statuses.includes('danger')) return 'Danger';
  if (statuses.includes('warning')) return 'Warning';
  return 'Safe';
};

export const generateSensorData = () => {
  const sampleType = Math.random();

  let h2s;
  let ch4;
  let waterLevel;

  if (sampleType > 0.65) {
    h2s = randomInRange(1.2, 6.6);
    ch4 = randomInRange(120, 680);
    waterLevel = randomInRange(5, 34);
  } else if (sampleType > 0.3) {
    h2s = randomInRange(7.1, 9.8);
    ch4 = randomInRange(700, 980);
    waterLevel = randomInRange(35, 49);
  } else {
    h2s = randomInRange(10.2, 18);
    ch4 = randomInRange(1005, 1450);
    waterLevel = randomInRange(50, 82);
  }

  const status = getOverallStatus({ h2s, ch4, waterLevel });

  return {
    h2s,
    ch4,
    waterLevel,
    waterDistance: clamp(MANHOLE_DEPTH_CM - waterLevel, 0, MANHOLE_DEPTH_CM),
    status,
    alert: status === 'Danger',
    battery: Math.round(randomInRange(82, 100)),
    sensorStatus: 'Simulated',
    source: 'demo',
    location: DEFAULT_LOCATION,
    lastUpdated: new Date().toISOString(),
  };
};

export const generateTimeSeriesData = () => {
  const now = new Date();
  const data = [];

  for (let i = 19; i >= 0; i -= 1) {
    const reading = generateSensorData();
    const time = new Date(now.getTime() - i * 2 * 60000);

    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      h2s: reading.h2s,
      ch4: reading.ch4,
      waterLevel: reading.waterLevel,
    });
  }

  return data;
};
