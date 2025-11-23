import React, { useState, useEffect } from 'react';
import { Card, CardBody, Spinner, Badge } from 'reactstrap';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faProjectDiagram, faCheckCircle, faTimesCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { DependencyType } from 'app/shared/model/status-dependency.model';
import './dependency-tree.scss';

interface TreeNode {
  id: string;
  name: string;
  type: DependencyType;
  itemId: number;
  status: 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';
  lastChecked?: string;
  responseTimeMs?: number;
  errorMessage?: string;
  metadata?: string;
  children: TreeNode[];
}

interface DependencyTreeProps {
  statusPageId?: number;
}

const DependencyTree: React.FC<DependencyTreeProps> = ({ statusPageId }) => {
  const [loading, setLoading] = useState(true);
  const [tree, setTree] = useState<TreeNode[]>([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [statusPageId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const url = statusPageId ? `/api/status-pages/${statusPageId}/dependencies` : '/api/status-dependencies/tree';
      const response = await axios.get<TreeNode[]>(url);
      setTree(response.data);
    } catch (error) {
      toast.error('Failed to load dependency tree');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UP':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />;
      case 'DOWN':
        return <FontAwesomeIcon icon={faTimesCircle} className="text-danger" />;
      case 'DEGRADED':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning" />;
      default:
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-secondary" />;
    }
  };

  const getTypeBadgeColor = (type: DependencyType) => {
    switch (type) {
      case DependencyType.HTTP:
        return 'primary';
      case DependencyType.SERVICE:
        return 'success';
      case DependencyType.INSTANCE:
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    return dayjs(timestamp).fromNow();
  };

  const parseMetadata = React.useMemo(() => {
    const cache = new Map<string, any>();
    return (metadata: string | undefined) => {
      if (!metadata) return null;
      if (cache.has(metadata)) return cache.get(metadata);
      try {
        const parsed = JSON.parse(metadata);
        cache.set(metadata, parsed);
        return parsed;
      } catch {
        return null;
      }
    };
  }, []);

  const renderHttpMetadata = (meta: any) => {
    if (!meta) return null;

    return (
      <div className="node-metadata ms-4 mt-2 p-2 border-start border-2 border-primary small">
        <div className="mb-1">
          <strong>Status:</strong> {meta.statusCode}
          {meta.responseSizeBytes && <span className="ms-2">Size: {(meta.responseSizeBytes / 1024).toFixed(2)} KB</span>}
        </div>
        <div className="mb-1">
          <strong>Timing:</strong> DNS: {meta.dnsLookupMs}ms
          <span className="ms-2">TCP: {meta.tcpConnectMs}ms</span>
          {meta.tlsHandshakeMs > 0 && <span className="ms-2">TLS: {meta.tlsHandshakeMs}ms</span>}
          <span className="ms-2">TTFB: {meta.ttfbMs}ms</span>
        </div>
      </div>
    );
  };

  const renderServiceMetadata = (meta: any) => {
    if (!meta) return null;

    return (
      <div className="node-metadata ms-4 mt-2 p-2 border-start border-2 border-success small">
        {meta.cluster && (
          <div className="mb-1">
            <strong>Cluster:</strong> {meta.cluster.cluster_state}
            {meta.cluster.cluster_size && <span className="ms-2">Masters: {meta.cluster.cluster_size}</span>}
            {meta.cluster.cluster_known_nodes && <span className="ms-2">Nodes: {meta.cluster.cluster_known_nodes}</span>}
            {meta.cluster.cluster_slots_assigned && <span className="ms-2">Slots: {meta.cluster.cluster_slots_assigned}/16384</span>}
          </div>
        )}
        {meta.memory && (
          <div className="mb-1">
            <strong>Memory:</strong> {meta.memory.used_memory_human}
            {meta.memory.used_memory_peak_human && <span className="ms-2">Peak: {meta.memory.used_memory_peak_human}</span>}
            {meta.memory.mem_fragmentation_ratio && <span className="ms-2">Frag: {meta.memory.mem_fragmentation_ratio}</span>}
          </div>
        )}
        {meta.server && (
          <div className="mb-1">
            <strong>Server:</strong> v{meta.server.redis_version}
            {meta.server.uptime_in_seconds && <span className="ms-2">Uptime: {Math.floor(meta.server.uptime_in_seconds / 60)}m</span>}
          </div>
        )}
        {meta.stats && (
          <div>
            <strong>Performance:</strong> {meta.stats.instantaneous_ops_per_sec} ops/sec
            {meta.stats.total_commands_processed && (
              <span className="ms-2">Cmds: {meta.stats.total_commands_processed.toLocaleString()}</span>
            )}
            {meta.stats.keyspace_hits !== undefined && <span className="ms-2">Hits: {meta.stats.keyspace_hits}</span>}
            {meta.stats.keyspace_misses !== undefined && <span className="ms-2">Misses: {meta.stats.keyspace_misses}</span>}
          </div>
        )}
        {meta.connected_node && (
          <div className="mt-1 text-muted">
            <small>Connected: {meta.connected_node}</small>
          </div>
        )}
      </div>
    );
  };

  const renderInstanceMetadata = (meta: any) => {
    if (!meta) return null;

    const instance = meta.instance;
    const heartbeat = meta.heartbeat;

    if (!instance || !heartbeat) return null;

    const hasHardware =
      heartbeat.cpuUsage !== undefined ||
      heartbeat.memoryUsage !== undefined ||
      heartbeat.diskUsage !== undefined ||
      heartbeat.loadAverage !== undefined;
    const hasPing = heartbeat.responseTimeMs !== undefined && heartbeat.responseTimeMs !== null;

    return (
      <div className="node-metadata ms-4 mt-2 p-2 border-start border-2 border-info small">
        <div className="mb-1">
          {instance.hostname && (
            <span>
              <strong>Host:</strong> {instance.hostname}
            </span>
          )}
          {instance.privateIpAddress && (
            <span className="ms-2">
              <strong>IP:</strong> {instance.privateIpAddress}
            </span>
          )}
          {instance.instanceType && (
            <span className="ms-2">
              <strong>Type:</strong> {instance.instanceType}
            </span>
          )}
        </div>
        {hasPing && (
          <div className="mb-1">
            <strong>Ping Uptime:</strong> <span className="ms-2">{heartbeat.responseTimeMs}ms</span>
            {heartbeat.packetLoss !== undefined && heartbeat.packetLoss !== null && (
              <span className="ms-2">Loss: {heartbeat.packetLoss.toFixed(1)}%</span>
            )}
          </div>
        )}
        {hasHardware && (
          <div>
            <strong>Hardware metrics:</strong>
            {heartbeat.cpuUsage !== undefined && heartbeat.cpuUsage !== null && (
              <span className="ms-2">CPU: {heartbeat.cpuUsage.toFixed(1)}%</span>
            )}
            {heartbeat.memoryUsage !== undefined && heartbeat.memoryUsage !== null && (
              <span className="ms-2">Memory: {heartbeat.memoryUsage.toFixed(1)}%</span>
            )}
            {heartbeat.diskUsage !== undefined && heartbeat.diskUsage !== null && (
              <span className="ms-2">Disk: {heartbeat.diskUsage.toFixed(1)}%</span>
            )}
            {heartbeat.loadAverage !== undefined && heartbeat.loadAverage !== null && (
              <span className="ms-2">Load: {heartbeat.loadAverage.toFixed(2)}</span>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderNode = React.useCallback(
    (node: TreeNode, level = 0) => {
      const meta = parseMetadata(node.metadata);

      return (
        <div key={node.id} className="dependency-node" style={{ marginLeft: `${level * 30}px` }}>
          <div className="node-content d-flex align-items-center gap-2">
            {getStatusIcon(node.status)}
            <Badge color={getTypeBadgeColor(node.type)}>{node.type}</Badge>
            <strong>{node.name}</strong>
            {node.responseTimeMs !== null && node.responseTimeMs !== undefined && (
              <span className="text-muted small">({node.responseTimeMs}ms)</span>
            )}
            {node.lastChecked && <span className="text-muted small ms-auto">{getTimeAgo(node.lastChecked)}</span>}
          </div>
          {node.type === DependencyType.HTTP && renderHttpMetadata(meta)}
          {node.type === DependencyType.SERVICE && renderServiceMetadata(meta)}
          {node.type === DependencyType.INSTANCE && renderInstanceMetadata(meta)}
          {node.errorMessage && <div className="node-error ms-4 mt-1 small text-danger">{node.errorMessage}</div>}
          {node.children.length > 0 && <div className="node-children mt-2">{node.children.map(child => renderNode(child, level + 1))}</div>}
        </div>
      );
    },
    [parseMetadata],
  );

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner color="primary" />
        <p className="mt-2">Loading dependency tree...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardBody>
        <h5 className="mb-3">
          <FontAwesomeIcon icon={faProjectDiagram} className="me-2" />
          Dependency Tree
        </h5>

        {tree.length === 0 ? (
          <div className="alert alert-info">
            {statusPageId ? 'No items added to this status page yet.' : 'No dependencies configured yet.'}
          </div>
        ) : (
          <div className="dependency-tree">{tree.map(node => renderNode(node))}</div>
        )}
      </CardBody>
    </Card>
  );
};

export default DependencyTree;
