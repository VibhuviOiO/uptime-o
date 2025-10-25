import React from 'react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useHeartbeats } from '@/hooks/useHeartbeats';

interface SparklineProps {
  monitorId: number;
  datacenterId: number;
  window: string;
}

export const Sparkline: React.FC<SparklineProps> = ({ monitorId, datacenterId, window }) => {
  const { data: heartbeats, loading, error } = useHeartbeats(monitorId, datacenterId, window, 1000);

  // Show individual bars for each heartbeat (like OpenAI status entries)
  const chartData = React.useMemo(() => {
    // For 24h, show all available heartbeats (up to 1000), for shorter windows limit to prevent overcrowding
    const maxBars = window === '24h' ? 1000 : window === '4h' ? 200 : 100;
    
    return heartbeats
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-maxBars) // Show more checks for longer time windows
      .map((hb, index) => ({
        index,
        time: new Date(hb.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        fullTime: new Date(hb.timestamp).toLocaleString(),
        timestamp: hb.timestamp,
        success: hb.success ? 1 : 0,
        status: hb.success ? 'success' : 'failed',
      }));
  }, [heartbeats, window]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="text-sm text-gray-600 mb-2">{data.fullTime}</div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${data.success ? 'bg-green-500 shadow-green-200 shadow-sm' : 'bg-red-500 shadow-red-200 shadow-sm'}`}></div>
            <span className={`text-sm font-semibold ${data.success ? 'text-green-700' : 'text-red-700'}`}>
              {data.success ? 'Success' : 'Failed'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="w-full h-16 flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-16 flex items-center justify-center">
        <div className="text-sm text-red-500">Error loading data</div>
      </div>
    );
  }

  return (
    <div className="w-full h-16">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis hide />
          <YAxis hide domain={[0, 1]} />
          <Bar
            dataKey={() => 1} // Always show a bar of height 1
            radius={[2, 2, 0, 0]}
            shape={(props: any) => {
              const { payload, x, y, width, height } = props;
              const isSuccess = payload.success;
              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={isSuccess ? '#10b981' : '#ef4444'}
                  stroke={isSuccess ? '#059669' : '#dc2626'}
                  strokeWidth={0.5}
                  rx={2}
                  className="transition-all duration-200 hover:opacity-80"
                />
              );
            }}
          />
          <Tooltip content={<CustomTooltip />} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};