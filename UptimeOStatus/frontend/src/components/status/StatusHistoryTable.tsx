
import React from "react";
import { Badge } from "@/components/ui/badge";
import { useStatusHistory } from "@/hooks/useStatusHistory";
import { Bar } from 'recharts';

const statusIcon = {
  operational: <span className="text-green-600">✔️</span>,
  degraded: <span className="text-yellow-500">⚠️</span>,
  down: <span className="text-red-500">❌</span>,
  info: <span className="text-blue-500">ℹ️</span>
};

export const StatusHistoryTable = () => {
  const [filter, setFilter] = React.useState("15min");
  const { data, loading, error } = useStatusHistory(filter);

  const filterOptions = [
    { label: "5 min", value: "5min" },
    { label: "15 min", value: "15min" },
    { label: "30 min", value: "30min" },
    { label: "1 hour", value: "1hour" },
    { label: "4 hours", value: "4hours" },
    { label: "1 day", value: "1day" },
    { label: "7 days", value: "7days" },
    { label: "1 month", value: "1month" }
  ];

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading status history...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="overflow-x-auto rounded-lg border mb-8 bg-white">
      <div className="flex items-center justify-end p-4">
        <label className="mr-2 font-medium">Filter:</label>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {filterOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-gray-50 z-10">
          <tr>
            <th className="py-3 px-4 text-left font-semibold">Service</th>
            <th className="py-3 px-4 text-left font-semibold">Region</th>
            <th className="py-3 px-4 text-left font-semibold">Datacenter</th>
            {data.days.map(day => (
              <th key={day} className="py-3 px-4 text-center font-semibold">{day}</th>
            ))}
            <th className="py-3 px-4 text-center font-semibold">Response Times</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map(row => (
            <tr key={row.service + row.datacenter} className="border-b last:border-b-0">
              <td className="py-2 px-4 font-medium whitespace-nowrap">{row.service}</td>
              <td className="py-2 px-4 whitespace-nowrap">{row.region}</td>
              <td className="py-2 px-4 whitespace-nowrap">{row.datacenter}</td>
              {row.statuses.map((status, idx) => (
                <td key={idx} className="py-2 px-4 text-center">
                  {statusIcon[status]}
                </td>
              ))}
              <td className="py-2 px-4 text-center">
                <div className="flex items-end gap-1 h-8">
                  {row.responseTimes && row.responseTimes.map((rt, idx) => (
                    <div
                      key={idx}
                      style={{ height: `${Math.max(rt / 4, 4)}px` }}
                      className={`w-3 rounded bg-blue-400 ${rt > 300 ? 'bg-red-400' : rt > 200 ? 'bg-yellow-400' : 'bg-blue-400'}`}
                      title={`Day ${data.days[idx]}: ${rt}ms`}
                    />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatusHistoryTable;
