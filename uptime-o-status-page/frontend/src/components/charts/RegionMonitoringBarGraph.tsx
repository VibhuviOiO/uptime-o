import React from 'react';
import GenericChart from '@/components/charts/GenericChart';

interface MonitorHistory {
  id: number;
  executedAt: string;
  success: boolean;
  responseTime: number;
  responseStatusCode?: number;
  responseSizeBytes?: number;
  responseServer?: string;
  responseCacheStatus?: string;
  dnsLookupMs?: number;
  tcpConnectMs?: number;
  tlsHandshakeMs?: number;
  timeToFirstByteMs?: number;
  rawResponseHeaders?: any;
  rawResponseBody?: any;
  errorType?: string;
  errorMessage?: string;
  agentRegion?: string;
  agentId?: string;
}

interface MonitorDetails {
  id: number;
  monitorName: string;
  url: string;
  monitorType: string;
  targetHost?: string;
  targetPath?: string;
  frequency: number;
  enabled: boolean;
  warningThresholdMs?: number;
  criticalThresholdMs?: number;
  createdAt: string;
  updatedAt: string;
}

interface RegionMonitoringBarGraphProps {
  records: MonitorHistory[];
  availabilityTimeRange: string;
  monitor: MonitorDetails;
  height?: number;
}

const RegionMonitoringBarGraph: React.FC<RegionMonitoringBarGraphProps> = ({
  records,
  availabilityTimeRange,
  monitor,
  height = 140,
}) => {
  const chartData = React.useMemo(() => {
    // Create time buckets for visualization
    const now = new Date();

    // Calculate time range in milliseconds
    let timeRangeMs: number;
    switch (availabilityTimeRange) {
      case "5m":
        timeRangeMs = 5 * 60 * 1000;
        break;
      case "15m":
        timeRangeMs = 15 * 60 * 1000;
        break;
      case "30m":
        timeRangeMs = 30 * 60 * 1000;
        break;
      case "1h":
        timeRangeMs = 60 * 60 * 1000;
        break;
      case "4h":
        timeRangeMs = 4 * 60 * 60 * 1000;
        break;
      case "24h":
        timeRangeMs = 24 * 60 * 60 * 1000;
        break;
      case "2d":
        timeRangeMs = 2 * 24 * 60 * 60 * 1000;
        break;
      case "7d":
        timeRangeMs = 7 * 24 * 60 * 60 * 1000;
        break;
      case "30d":
        timeRangeMs = 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        timeRangeMs = 24 * 60 * 60 * 1000;
    }

    const startTime = new Date(now.getTime() - timeRangeMs);
    const numBuckets = 50;
    const bucketSize = timeRangeMs / numBuckets;

    return Array.from({ length: numBuckets }, (_, i) => {
      const bucketStart = startTime.getTime() + i * bucketSize;
      const bucketEnd = bucketStart + bucketSize;
      const bucketStartDate = new Date(bucketStart);

      const bucketRecords = records.filter((r) => {
        const recordTime = new Date(r.executedAt).getTime();
        return recordTime >= bucketStart && recordTime < bucketEnd;
      });

      // Count by status
      let healthy = 0;
      let warning = 0;
      let critical = 0;
      let failed = 0;

      bucketRecords.forEach((r) => {
        if (!r.success) {
          failed++;
        } else {
          const warningThreshold = monitor?.warningThresholdMs || 500;
          const criticalThreshold = monitor?.criticalThresholdMs || 1000;
          const rt = r.responseTime || 0;

          if (rt >= criticalThreshold) {
            critical++;
          } else if (rt >= warningThreshold) {
            warning++;
          } else {
            healthy++;
          }
        }
      });

      return {
        index: i,
        time: bucketStartDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        timestamp: bucketStartDate.toLocaleString(),
        healthy,
        warning,
        critical,
        failed,
        total: bucketRecords.length,
      };
    });
  }, [records, availabilityTimeRange, monitor]);

  return (
    <GenericChart
      type="bar"
      data={chartData}
      xKey="time"
      yKeys={['healthy', 'warning', 'critical', 'failed']}
      colors={['#10b981', '#fbbf24', '#f97316', '#ef4444']}
      height={height}
    />
  );
};

export default RegionMonitoringBarGraph;