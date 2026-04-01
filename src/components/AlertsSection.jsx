import React from 'react';
import { FiBell, FiAlertTriangle } from 'react-icons/fi';
import { getStatusBgColor, getStatusTextColor } from '../utils/helpers';

const AlertsSection = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <div className="card-transition animate-slide-up rounded-lg border border-green-200 bg-green-50 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiBell size={20} className="text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">Alerts</h3>
        </div>
        <div className="flex items-center justify-center gap-2 py-8">
          <div className="h-3 w-3 rounded-full bg-green-600"></div>
          <p className="text-green-700 font-medium">All systems operating normally</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-transition animate-slide-up rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <FiBell size={20} className="text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          Alerts & Warnings ({alerts.length})
        </h3>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 rounded-lg border-l-4 p-4 ${getStatusBgColor(
              alert.status
            )}`}
          >
            <FiAlertTriangle
              size={20}
              className={`mt-0.5 flex-shrink-0 ${getStatusTextColor(
                alert.status
              )}`}
            />
            <div>
              <p className={`font-semibold ${getStatusTextColor(alert.status)}`}>
                {alert.title}
              </p>
              <p
                className={`text-sm mt-1 ${getStatusTextColor(alert.status)}`}
              >
                {alert.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsSection;
