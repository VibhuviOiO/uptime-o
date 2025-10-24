import React from 'react';
import {
  LineChart as RechartsLineChart,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Bar,
} from 'recharts';

interface GenericChartProps {
  type: 'line' | 'bar';
  data: any[];
  xKey: string;
  yKeys: string[];
  colors: string[];
  height?: number;
  showThresholds?: boolean;
  warningThreshold?: number;
  criticalThreshold?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  tooltipFormatter?: (value: any, name: string, props: any) => [string, string];
  customTooltip?: React.ComponentType<any>;
}

const GenericChart: React.FC<GenericChartProps> = ({
  type,
  data,
  xKey,
  yKeys,
  colors,
  height = 220,
  showThresholds = false,
  warningThreshold,
  criticalThreshold,
  xAxisLabel,
  yAxisLabel,
  tooltipFormatter,
  customTooltip,
}) => {
  const defaultTooltipFormatter = (value: any, name: string) => [
    `${value}${yAxisLabel?.includes('ms') ? 'ms' : ''}`,
    name
  ];

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" strokeOpacity={0.6} vertical={false} />
        <XAxis
          dataKey={xKey}
          stroke="#64748b"
          tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
          interval="preserveStartEnd"
          axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
          tickLine={{ stroke: '#cbd5e1' }}
        />
        <YAxis
          stroke="#64748b"
          tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
          label={{
            value: yAxisLabel,
            angle: -90,
            position: 'insideLeft',
            style: { fontSize: 11, fill: '#64748b', fontWeight: 500 }
          }}
          axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
          tickLine={{ stroke: '#cbd5e1' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#ffffff',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
          labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
          formatter={tooltipFormatter || defaultTooltipFormatter}
          content={customTooltip}
        />

        {/* Threshold Lines */}
        {showThresholds && warningThreshold !== undefined && (
          <Line
            type="monotone"
            dataKey={() => warningThreshold}
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            name="Warning Threshold"
            isAnimationActive={false}
          />
        )}
        {showThresholds && criticalThreshold !== undefined && (
          <Line
            type="monotone"
            dataKey={() => criticalThreshold}
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            name="Critical Threshold"
            isAnimationActive={false}
          />
        )}

        {/* Data Lines */}
        {yKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            strokeWidth={3}
            dot={{ r: 3, fill: colors[index % colors.length], strokeWidth: 2, stroke: '#ffffff' }}
            connectNulls
            name={key}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 15, right: 15, left: 5, bottom: 25 }}>
        <CartesianGrid
          strokeDasharray="2 2"
          stroke="#e2e8f0"
          strokeOpacity={0.6}
          vertical={false}
        />
        <XAxis
          dataKey={xKey}
          stroke="#64748b"
          tick={{
            fill: "#64748b",
            fontSize: 10,
            fontWeight: 500,
          }}
          interval="preserveStartEnd"
          angle={0}
          axisLine={{ stroke: "#cbd5e1", strokeWidth: 1 }}
          tickLine={{ stroke: "#cbd5e1" }}
        />
        <YAxis
          stroke="#64748b"
          tick={{
            fill: "#64748b",
            fontSize: 11,
            fontWeight: 500,
          }}
          width={40}
          axisLine={{ stroke: "#cbd5e1", strokeWidth: 1 }}
          tickLine={{ stroke: "#cbd5e1" }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-slate-900/95 backdrop-blur-sm text-white text-sm rounded-xl shadow-xl p-4 border border-slate-700/50">
                  <div className="font-bold mb-2 text-slate-100">
                    {data.timestamp || data.time}
                  </div>
                  <div className="font-semibold mb-3 text-slate-200">
                    Checks: {data.total || payload.reduce((sum, p) => sum + (p.value || 0), 0)}
                  </div>
                  {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="font-medium">
                        {entry.name}: {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          }}
        />

        {/* Stacked Bars */}
        {yKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="a"
            fill={colors[index % colors.length]}
            radius={index === yKeys.length - 1 ? [4, 4, 0, 0] : [2, 2, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  return type === 'line' ? renderLineChart() : renderBarChart();
};

export default GenericChart;