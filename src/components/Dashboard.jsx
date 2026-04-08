import React, { useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { FaGasPump, FaWater, FaHeartbeat } from 'react-icons/fa';
import SummaryCard from './SummaryCard';
import ChartSection from './ChartSection';
import AlertsSection from './AlertsSection';
import LocationPanel from './LocationPanel';
import DeviceHealthSection from './DeviceHealthSection';
import {
  generateSensorData,
  generateTimeSeriesData,
  thresholds,
} from '../utils/data';
import { getStatus } from '../utils/helpers';
import {
  bridgeApiBase,
  fetchBridgeHealth,
  fetchLatestSensorSnapshot,
  fetchSensorHistory,
} from '../utils/liveData';

const HISTORY_LIMIT = 20;
const POLL_INTERVAL_MS = 3000;

const buildAlerts = (sensorData) => {
  const newAlerts = [];

  const h2sStatus = getStatus(
    sensorData.h2s,
    thresholds.h2sWarning,
    thresholds.h2sDanger
  );
  if (h2sStatus === 'danger') {
    newAlerts.push({
      status: 'danger',
      title: 'Critical H2S Level',
      message: `H2S concentration is ${sensorData.h2s} ppm, exceeding the ${thresholds.h2sDanger} ppm danger threshold.`,
    });
  } else if (h2sStatus === 'warning') {
    newAlerts.push({
      status: 'warning',
      title: 'Elevated H2S Detected',
      message: `H2S concentration is ${sensorData.h2s} ppm and trending toward the critical limit.`,
    });
  }

  const ch4Status = getStatus(
    sensorData.ch4,
    thresholds.ch4Warning,
    thresholds.ch4Danger
  );
  if (ch4Status === 'danger') {
    newAlerts.push({
      status: 'danger',
      title: 'Methane Danger',
      message: `CH4 concentration is ${sensorData.ch4} ppm, above the ${thresholds.ch4Danger} ppm alarm threshold.`,
    });
  } else if (ch4Status === 'warning') {
    newAlerts.push({
      status: 'warning',
      title: 'Methane Warning',
      message: `CH4 concentration is ${sensorData.ch4} ppm and nearing the alarm threshold.`,
    });
  }

  const waterStatus = getStatus(
    sensorData.waterLevel,
    thresholds.waterLevelWarning,
    thresholds.waterLevelDanger
  );
  if (waterStatus === 'danger') {
    newAlerts.push({
      status: 'danger',
      title: 'Overflow Risk Critical',
      message: `Water level is ${sensorData.waterLevel} cm, exceeding the ${thresholds.waterLevelDanger} cm overflow limit.`,
    });
  } else if (waterStatus === 'warning') {
    newAlerts.push({
      status: 'warning',
      title: 'Overflow Risk',
      message: `Water level is ${sensorData.waterLevel} cm and rising toward the overflow limit.`,
    });
  }

  return newAlerts;
};

const formatChartTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const sortReadings = (readings = []) =>
  [...readings].sort(
    (firstReading, secondReading) =>
      new Date(firstReading.lastUpdated) - new Date(secondReading.lastUpdated)
  );

const buildChartData = (readings = []) =>
  sortReadings(readings)
    .slice(-HISTORY_LIMIT)
    .map((reading) => ({
      time: formatChartTime(reading.lastUpdated),
      h2s: reading.h2s,
      ch4: reading.ch4,
      waterLevel: reading.waterLevel,
    }));

const readBridgeState = async () => {
  const [healthResult, latestResult, historyResult] = await Promise.allSettled([
    fetchBridgeHealth(),
    fetchLatestSensorSnapshot(),
    fetchSensorHistory(HISTORY_LIMIT),
  ]);

  const bridgeHealth =
    healthResult.status === 'fulfilled' ? healthResult.value : null;
  const latestSnapshot =
    latestResult.status === 'fulfilled' ? latestResult.value : null;
  const historySnapshot =
    historyResult.status === 'fulfilled' ? historyResult.value : null;
  const historyReadings = Array.isArray(historySnapshot?.readings)
    ? historySnapshot.readings
    : [];
  const latestReading =
    latestSnapshot?.reading ||
    historyReadings[historyReadings.length - 1] ||
    null;

  return {
    bridgeHealth,
    historySnapshot,
    latestReading,
    historyReadings,
  };
};

const buildIntegrationState = ({
  mode,
  bridgeHealth = null,
  totalReadings = 0,
}) => {
  const storageMode = bridgeHealth?.storageMode || 'offline';

  if (mode === 'live') {
    return {
      mode,
      label: 'Wokwi Live',
      storageMode,
      totalReadings,
      message:
        'Dashboard is reading the Wokwi bridge in real time and updating from the live sensor stream.',
    };
  }

  if (mode === 'waiting') {
    return {
      mode,
      label: 'Waiting for Stream',
      storageMode,
      totalReadings,
      message:
        'The bridge is reachable, but it has not received any Wokwi readings yet. Start the simulator and watcher to populate the dashboard.',
    };
  }

  if (mode === 'disconnected') {
    return {
      mode,
      label: 'Bridge Offline',
      storageMode,
      totalReadings,
      message:
        'The last live reading is still shown, but the bridge is not responding right now.',
    };
  }

  return {
    mode: 'demo',
    label: 'Demo Mode',
    storageMode,
    totalReadings,
    message: `No bridge was found at ${bridgeApiBase}, so the dashboard is showing built-in sample data.`,
  };
};

const Dashboard = () => {
  const [data, setData] = useState(() => generateSensorData());
  const [chartData, setChartData] = useState(() => generateTimeSeriesData());
  const [alerts, setAlerts] = useState(() => buildAlerts(generateSensorData()));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLiveFeed, setHasLiveFeed] = useState(false);
  const [integration, setIntegration] = useState(
    buildIntegrationState({ mode: 'demo' })
  );

  useEffect(() => {
    setAlerts(buildAlerts(data));
  }, [data]);

  useEffect(() => {
    let isMounted = true;

    const syncLiveData = async () => {
      const bridgeState = await readBridgeState();
      if (!isMounted) {
        return;
      }

      if (bridgeState.latestReading) {
        const readings =
          bridgeState.historyReadings.length > 0
            ? bridgeState.historyReadings
            : [bridgeState.latestReading];

        setData(bridgeState.latestReading);
        setChartData(buildChartData(readings));
        setIntegration(
          buildIntegrationState({
            mode: 'live',
            bridgeHealth: bridgeState.bridgeHealth,
            totalReadings:
              bridgeState.historySnapshot?.totalReadings || readings.length,
          })
        );
        setHasLiveFeed(true);
        return;
      }

      if (bridgeState.bridgeHealth) {
        setIntegration(
          buildIntegrationState({
            mode: 'waiting',
            bridgeHealth: bridgeState.bridgeHealth,
            totalReadings: bridgeState.historySnapshot?.totalReadings || 0,
          })
        );
        return;
      }

      setIntegration(
        buildIntegrationState({
          mode: hasLiveFeed ? 'disconnected' : 'demo',
        })
      );
    };

    void syncLiveData();
    const intervalId = window.setInterval(() => {
      void syncLiveData();
    }, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [hasLiveFeed]);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    const bridgeState = await readBridgeState();

    if (bridgeState.latestReading) {
      const readings =
        bridgeState.historyReadings.length > 0
          ? bridgeState.historyReadings
          : [bridgeState.latestReading];

      setData(bridgeState.latestReading);
      setChartData(buildChartData(readings));
      setIntegration(
        buildIntegrationState({
          mode: 'live',
          bridgeHealth: bridgeState.bridgeHealth,
          totalReadings:
            bridgeState.historySnapshot?.totalReadings || readings.length,
        })
      );
      setHasLiveFeed(true);
      setIsRefreshing(false);
      return;
    }

    if (bridgeState.bridgeHealth) {
      setIntegration(
        buildIntegrationState({
          mode: 'waiting',
          bridgeHealth: bridgeState.bridgeHealth,
          totalReadings: bridgeState.historySnapshot?.totalReadings || 0,
        })
      );
      setIsRefreshing(false);
      return;
    }

    const fallbackData = generateSensorData();
    setData(fallbackData);
    setChartData(generateTimeSeriesData());
    setIntegration(buildIntegrationState({ mode: 'demo' }));
    setHasLiveFeed(false);
    setIsRefreshing(false);
  };

  const h2sStatus = getStatus(
    data.h2s,
    thresholds.h2sWarning,
    thresholds.h2sDanger
  );
  const ch4Status = getStatus(
    data.ch4,
    thresholds.ch4Warning,
    thresholds.ch4Danger
  );
  const waterStatus = getStatus(
    data.waterLevel,
    thresholds.waterLevelWarning,
    thresholds.waterLevelDanger
  );
  const overallStatus =
    data.status?.toLowerCase() === 'warning'
      ? 'warning'
      : data.status?.toLowerCase() === 'danger'
        ? 'danger'
        : 'safe';
  const integrationToneClasses = {
    live: 'border-green-200 bg-green-50 text-green-800',
    waiting: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    disconnected: 'border-orange-200 bg-orange-50 text-orange-800',
    demo: 'border-gray-200 bg-gray-100 text-gray-700',
  };
  const integrationBadgeClass =
    integrationToneClasses[integration.mode] || integrationToneClasses.demo;
  const sensorStatusLabel =
    integration.mode === 'live'
      ? data.sensorStatus || 'Working'
      : integration.mode === 'waiting'
        ? 'Waiting for stream'
        : integration.mode === 'disconnected'
          ? 'Bridge offline'
          : 'Demo mode';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-600 p-2">
                <FaGasPump size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Smart Manhole Monitoring
                </h1>
                <p className="text-sm text-gray-600">
                  Real-time gas, overflow, and Wokwi simulation monitoring
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${integrationBadgeClass}`}
              >
                {integration.label}
              </div>

              <button
                onClick={handleRefresh}
                className={`rounded-lg bg-blue-600 p-3 text-white transition-all hover:bg-blue-700 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
                title="Refresh data"
              >
                <FiRefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Simulation Feed Status
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {integration.message}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-3">
                <div className="rounded-lg bg-gray-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Storage
                  </p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {integration.storageMode}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Readings Stored
                  </p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {integration.totalReadings}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    API Base
                  </p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {bridgeApiBase}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Real-Time Metrics
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="H2S Level"
              value={data.h2s}
              unit="ppm"
              status={h2sStatus}
              icon={FaGasPump}
            />
            <SummaryCard
              title="CH4 Level"
              value={data.ch4}
              unit="ppm"
              status={ch4Status}
              icon={FaGasPump}
            />
            <SummaryCard
              title="Water Level"
              value={data.waterLevel}
              unit="cm"
              status={waterStatus}
              icon={FaWater}
            />
            <SummaryCard
              title="Overall Status"
              value={data.status}
              unit=""
              status={overallStatus}
              icon={FaHeartbeat}
            />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Historical Trends (Last 20 readings)
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {chartData.length > 0 && (
              <>
                <ChartSection
                  title="H2S Concentration"
                  data={chartData}
                  dataKey="h2s"
                  color="#3b82f6"
                  unit="ppm"
                  icon={FaGasPump}
                />
                <ChartSection
                  title="CH4 Level"
                  data={chartData}
                  dataKey="ch4"
                  color="#8b5cf6"
                  unit="ppm"
                  icon={FaGasPump}
                />
                <ChartSection
                  title="Water Level"
                  data={chartData}
                  dataKey="waterLevel"
                  color="#06b6d4"
                  unit="cm"
                  icon={FaWater}
                />
              </>
            )}
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              System Alerts
            </h2>
            <AlertsSection alerts={alerts} />
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Device Health
            </h2>
            <DeviceHealthSection
              battery={data.battery}
              sensorStatus={sensorStatusLabel}
            />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Location & Metadata
          </h2>
          <LocationPanel
            location={data.location}
            lastUpdated={data.lastUpdated}
          />
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-gray-600">
            © 2024 Smart Manhole Monitoring System | Polling Wokwi bridge every
            3 seconds
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
