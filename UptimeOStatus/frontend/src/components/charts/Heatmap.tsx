import React from 'react';
import { StatusData } from '@/hooks/useStatus';

interface HeatmapProps {
  data: StatusData[];
}

export const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  // Group data by monitor and datacenter
  const monitors = [...new Set(data.map(d => d.monitorName))].sort();
  const datacenters = [...new Set(data.map(d => d.datacenter))].sort();

  const getCellData = (monitorName: string, datacenter: string) => {
    return data.find(d => d.monitorName === monitorName && d.datacenter === datacenter);
  };

  const getCellColor = (statusData?: StatusData) => {
    if (!statusData) return 'bg-gray-100';
    switch (statusData.status) {
      case 'operational': return 'bg-green-500';
      case 'degraded-orange': return 'bg-yellow-500';
      case 'degraded-red': return 'bg-orange-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getCellText = (statusData?: StatusData) => {
    if (!statusData) return '';
    return `${statusData.successRate}%`;
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="grid gap-1" style={{ gridTemplateColumns: `200px repeat(${datacenters.length}, 120px)` }}>
          {/* Header row */}
          <div className="font-semibold p-2 bg-gray-200 border border-gray-300">Monitor / Datacenter</div>
          {datacenters.map(dc => (
            <div key={dc} className="font-semibold p-2 bg-gray-200 border border-gray-300 text-center">
              {dc}
            </div>
          ))}

          {/* Data rows */}
          {monitors.map(monitor => (
            <React.Fragment key={monitor}>
              <div className="font-medium p-2 bg-gray-100 border border-gray-300">
                {monitor}
              </div>
              {datacenters.map(dc => {
                const cellData = getCellData(monitor, dc);
                return (
                  <div
                    key={`${monitor}-${dc}`}
                    className={`p-2 border border-gray-300 text-center text-white font-medium ${getCellColor(cellData)}`}
                    title={cellData ? `${monitor} - ${dc}: ${cellData.successRate}% success rate` : 'No data'}
                  >
                    {getCellText(cellData)}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};