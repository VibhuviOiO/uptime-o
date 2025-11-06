import React from 'react';
import './agent-bar-chart.scss';

interface AgentBarChartProps {
  data: Array<{
    time: string;
    timestamp: string;
    healthy: number;
    warning: number;
    critical: number;
    failed: number;
    total: number;
  }>;
  height?: number;
}

const AgentBarChart: React.FC<AgentBarChartProps> = ({ data, height = 140 }) => {
  // Find the maximum total for scaling
  const maxTotal = Math.max(...data.map(d => d.total), 1);

  // Calculate width per bar
  const barWidth = `${100 / data.length}%`;

  return (
    <div className="agent-bar-chart" style={{ height: `${height}px` }}>
      <div className="chart-container">
        {data.map((bucket, index) => {
          const total = bucket.total;

          // Calculate heights as percentages of maxTotal
          const healthyHeight = total > 0 ? (bucket.healthy / maxTotal) * 100 : 0;
          const warningHeight = total > 0 ? (bucket.warning / maxTotal) * 100 : 0;
          const criticalHeight = total > 0 ? (bucket.critical / maxTotal) * 100 : 0;
          const failedHeight = total > 0 ? (bucket.failed / maxTotal) * 100 : 0;

          return (
            <div
              key={index}
              className="chart-bar"
              style={{ width: barWidth }}
              title={`${bucket.timestamp}\nChecks: ${total}\nHealthy: ${bucket.healthy}\nWarning: ${bucket.warning}\nCritical: ${bucket.critical}\nFailed: ${bucket.failed}`}
            >
              <div className="bar-stack">
                {healthyHeight > 0 && <div className="bar-segment healthy" style={{ height: `${healthyHeight}%` }} />}
                {warningHeight > 0 && <div className="bar-segment warning" style={{ height: `${warningHeight}%` }} />}
                {criticalHeight > 0 && <div className="bar-segment critical" style={{ height: `${criticalHeight}%` }} />}
                {failedHeight > 0 && <div className="bar-segment failed" style={{ height: `${failedHeight}%` }} />}
              </div>
              {/* Show time label for every few bars to avoid crowding */}
              {index % Math.max(1, Math.floor(data.length / 10)) === 0 && <div className="time-label">{bucket.time}</div>}
            </div>
          );
        })}
      </div>
      {/* Hover tooltip will be shown via title attribute */}
    </div>
  );
};

export default AgentBarChart;
