import React from 'react';
import {
  getStatusColor,
  getStatusBorderColor,
  getIconColor,
} from '../utils/helpers';

const SummaryCard = ({ title, value, unit, status, icon: Icon }) => {
  return (
    <div
      className={`card-transition rounded-lg border-2 p-6 animate-slide-up ${getStatusColor(
        status
      )} ${getStatusBorderColor(status)}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">
          {title}
        </h3>
        {Icon && (
          <Icon
            size={24}
            color={getIconColor(status)}
            className="animate-fade-in"
          />
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold">{value}</p>
          <span className="text-sm font-medium opacity-75">{unit}</span>
        </div>
        <StatusBadge status={status} />
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const badgeClasses = {
    safe: 'bg-green-200 text-green-800',
    warning: 'bg-yellow-200 text-yellow-800',
    danger: 'bg-red-200 text-red-800',
  };

  const statusLabels = {
    safe: 'Safe',
    warning: 'Warning',
    danger: 'Danger',
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
};

export default SummaryCard;
