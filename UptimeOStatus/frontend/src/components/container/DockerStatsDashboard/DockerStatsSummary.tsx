import React from 'react';
import { Cpu, MemoryStick, HardDrive, Network, ListOrdered, Info } from 'lucide-react';
import type { DockerStats } from '../../../hooks/useDockerOps';

function getBadgeColor(percent: number) {
  if (percent < 60) return 'bg-green-500';
  if (percent < 85) return 'bg-yellow-500';
  return 'bg-red-500';
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes/1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes/1024/1024).toFixed(1)} MB`;
  return `${(bytes/1024/1024/1024).toFixed(1)} GB`;
}

export const DockerStatsSummary: React.FC<{ stats: DockerStats }> = ({ stats }) => {
  // CPU
  const onlineCPUs = stats.cpu_stats?.online_cpus || 1;
  const cpuTotal = stats.cpu_stats?.cpu_usage?.total_usage || 0;
  const cpuPercent = stats.cpu_stats && stats.cpu_stats.cpu_usage && stats.cpu_stats.system_cpu_usage
    ? ((cpuTotal / stats.cpu_stats.system_cpu_usage) * 100)
    : 0;

  // Memory
  const memStats = stats.memory_stats || {};
  const memUsed = memStats.usage || 0;
  const memLimit = memStats.limit || 1;
  const memPercent = (memUsed / memLimit) * 100;

  // Network
  const net = stats.networks?.eth0 || {};
  const rx = net.rx_bytes || 0;
  const tx = net.tx_bytes || 0;

  // Disk I/O
  const blkio = stats.blkio_stats?.io_service_bytes_recursive || [];
  const read = blkio.find((b: any) => b.op === 'read')?.value || 0;
  const write = blkio.find((b: any) => b.op === 'write')?.value || 0;

  // PID
  const pidCount = stats.pids_stats?.current || 0;
  const pidLimit = stats.pids_stats?.limit || 100;
  const pidPercent = (pidCount / pidLimit) * 100;

  const accent = "#2563eb"; // Tailwind blue-600
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const advancedStats = [
    { label: 'Throttling (CPU)', value: stats.cpu_stats?.throttling_data ? JSON.stringify(stats.cpu_stats.throttling_data) : '—' },
    { label: 'Blkio', value: stats.blkio_stats ? JSON.stringify(stats.blkio_stats) : '—' },
    { label: 'Memory Stats', value: stats.memory_stats?.stats ? JSON.stringify(stats.memory_stats.stats) : '—' },
  ];
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-gray-200 rounded overflow-hidden text-xs">
        {/* CPU */}
        <div className="flex flex-col px-3 py-2 border-b border-r border-gray-200">
          <div className="flex items-center gap-1 mb-1">
            <Cpu style={{ color: accent }} size={14} />
            <span>CPU</span>
            <span className="ml-auto text-[10px] text-gray-400">{onlineCPUs} CPUs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm">{cpuPercent.toFixed(2)}%</span>
            <div className="flex-1 h-1 bg-gray-100 rounded">
              <div style={{ width: `${cpuPercent}%`, background: accent }} className="h-1 rounded" />
            </div>
          </div>
        </div>
        {/* Memory */}
        <div className="flex flex-col px-3 py-2 border-b border-r border-gray-200">
          <div className="flex items-center gap-1 mb-1">
            <MemoryStick style={{ color: accent }} size={14} />
            <span>Memory</span>
            <span className="ml-auto text-[10px] text-gray-400">{formatBytes(memUsed)} / {formatBytes(memLimit)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm">{memPercent.toFixed(2)}%</span>
            <div className="flex-1 h-1 bg-gray-100 rounded">
              <div style={{ width: `${memPercent}%`, background: accent }} className="h-1 rounded" />
            </div>
          </div>
        </div>
        {/* Disk */}
        <div className="flex flex-col px-3 py-2 border-b border-r border-gray-200">
          <div className="flex items-center gap-1 mb-1">
            <HardDrive style={{ color: accent }} size={14} />
            <span>Disk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono">R: <span className="font-bold">{formatBytes(read)}</span></span>
            <span className="font-mono">W: <span className="font-bold">{formatBytes(write)}</span></span>
          </div>
        </div>
        {/* Network */}
        <div className="flex flex-col px-3 py-2 border-b border-gray-200">
          <div className="flex items-center gap-1 mb-1">
            <Network style={{ color: accent }} size={14} />
            <span>Network</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono">RX: <span className="font-bold">{formatBytes(rx)}</span></span>
            <span className="font-mono">TX: <span className="font-bold">{formatBytes(tx)}</span></span>
          </div>
        </div>
        {/* PID (full row) */}
        <div className="col-span-2 md:col-span-4 flex items-center px-3 py-2 border-b border-gray-200">
          <ListOrdered style={{ color: accent }} size={14} />
          <span className="ml-2">PID</span>
          <span className="ml-2 font-mono font-bold text-sm">{pidCount}</span>
          <span className="ml-2 text-[10px] text-gray-400">{pidLimit} Max</span>
          <div className="flex-1 h-1 bg-gray-100 rounded mx-2">
            <div style={{ width: `${pidPercent}%`, background: accent }} className="h-1 rounded" />
          </div>
          <button
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 focus:outline-none ml-2"
            onClick={() => setShowAdvanced(v => !v)}
          >
            <Info size={12} /> Advanced
            <span className="ml-1 text-[10px]">{showAdvanced ? '▲' : '▼'}</span>
          </button>
        </div>
      </div>
      {/* Advanced Section */}
      {showAdvanced && (
        <div className="mt-2 text-xs border border-gray-200 rounded p-2 bg-gray-50">
          <table className="w-full text-[10px]">
            <tbody>
              {advancedStats.map((stat, i) => (
                <tr key={i}>
                  <td className="font-semibold pr-2 align-top text-gray-600">{stat.label}</td>
                  <td className="font-mono break-all text-gray-700">{stat.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
