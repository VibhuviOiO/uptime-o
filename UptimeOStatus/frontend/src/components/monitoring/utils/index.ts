// Color scheme for different states - used by MonitorFilters
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    healthy: 'text-green-600',
    warning: 'text-yellow-600',
    critical: 'text-red-600',
    failed: 'text-gray-600',
    error: 'text-red-600',
    success: 'text-green-600'
  };
  return colors[status] || 'text-gray-600';
};