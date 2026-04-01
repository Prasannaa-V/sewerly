// Get status based on value and thresholds
export const getStatus = (value, warningThreshold, dangerThreshold) => {
  if (value >= dangerThreshold) return 'danger';
  if (value >= warningThreshold) return 'warning';
  return 'safe';
};

// Get color classes based on status
export const getStatusColor = (status) => {
  const colors = {
    safe: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    danger: 'bg-red-50 border-red-200 text-red-900',
  };
  return colors[status] || colors.safe;
};

export const getStatusBgColor = (status) => {
  const colors = {
    safe: 'bg-green-100',
    warning: 'bg-yellow-100',
    danger: 'bg-red-100',
  };
  return colors[status] || colors.safe;
};

export const getStatusTextColor = (status) => {
  const colors = {
    safe: 'text-green-700',
    warning: 'text-yellow-700',
    danger: 'text-red-700',
  };
  return colors[status] || colors.safe;
};

export const getStatusBorderColor = (status) => {
  const colors = {
    safe: 'border-green-300',
    warning: 'border-yellow-300',
    danger: 'border-red-300',
  };
  return colors[status] || colors.safe;
};

// Get icon color based on status
export const getIconColor = (status) => {
  const colors = {
    safe: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  };
  return colors[status] || colors.safe;
};

// Format timestamp
export const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString();
};
