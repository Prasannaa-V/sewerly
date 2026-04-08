import React, { useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { FaGasPump, FaWater, FaHeartbeat } from 'react-icons/fa';
import SummaryCard from './SummaryCard';
import ChartSection from './ChartSection';
import AlertsSection from './AlertsSection';
import LocationPanel from './LocationPanel';
import DeviceHealthSection from './DeviceHealthSection';
import { thresholds } from '../utils/data';
import { getStatus } from '../utils/helpers';

const Dashboard = () => {
  const [data, setData] = useState(generateSensorData());
  const [chartData, setChartData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const newChartData = generateTimeSeriesData();
    setChartData(newChartData);
    generateAlerts(data);
  }, []);

  const generateAlerts = (sensorData = data) => {
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
        message: `CH4 level is ${sensorData.ch4} %LEL, exceeding danger threshold of ${thresholds.ch4Danger} %LEL`,
      });
    } else if (ch4Status === 'warning') {
      newAlerts.push({
        status: 'warning',
        title: 'Methane Warning',
        message: `CH4 level is ${sensorData.ch4} %LEL, approaching danger level`,
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
        message: `Water level is ${sensorData.waterLevel} cm, exceeding danger threshold of ${thresholds.waterLevelDanger} cm`,
      });
    } else if (waterStatus === 'warning') {
      newAlerts.push({
        status: 'warning',
        title: 'Overflow Risk',
        message: `Water level is ${sensorData.waterLevel} cm, approaching danger level`,
      });
    }

    setAlerts(newAlerts);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newData = generateSensorData();
      const newChartData = generateTimeSeriesData();
      setData(newData);
      setChartData(newChartData);
      generateAlerts(newData);
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
    data.status.toLowerCase() === 'warning'
      ? 'warning'
      : data.status.toLowerCase() === 'danger'
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
      {/* Header */}
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
                  Real-time Gas & Overflow Monitoring System
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

      {/* Main Content */}
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
                    Bridge
                  </p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {integration.storageMode}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Readings Cached
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

        {/* Summary Cards Section */}
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

        {/* Charts Section */}
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

        {/* Alerts and Info Section */}
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

        {/* Location Panel */}
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

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            © 2024 Smart Manhole Monitoring System | Polling Wokwi bridge every 3 seconds
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
