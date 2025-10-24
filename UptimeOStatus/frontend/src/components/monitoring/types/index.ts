import { type Monitor } from "@/hooks/useMonitors";

export type HTTPMonitor = Monitor;

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type MonitorStatus = 'healthy' | 'error' | 'redirect' | 'warning';

export type ResponseTimeCategory = 'healthy' | 'warning' | 'critical' | 'failed';

export type DatacenterRegion = string;

export type ViewMode = 'grid' | 'table';

export interface FilterState {
  search: string;
  method: HTTPMethod | 'all';
  status: MonitorStatus | 'all';
  region: DatacenterRegion | 'all';
  responseTime: ResponseTimeCategory | 'all';
  showActiveOnly: boolean;
  activeWindow: number; // minutes
}

export interface SortConfig {
  field: keyof HTTPMonitor | null;
  direction: 'asc' | 'desc';
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  visible: boolean;
}

export interface MonitorStats {
  total: number;
  healthy: number;
  errors: number;
  redirects: number;
  responseTimeDistribution: {
    healthy: number;
    warning: number;
    critical: number;
    failed: number;
  };
  averageResponseTime: number;
  uptimePercentage: number;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'excel';
  includeHeaders: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  columns: string[];
}

export interface MonitorComparison {
  monitors: HTTPMonitor[];
  metrics: Array<{
    name: string;
    values: Record<string, number | string>;
  }>;
}

export interface AlertRule {
  id: string;
  monitorId: string;
  condition: 'response_time' | 'status_code' | 'uptime';
  operator: 'gt' | 'lt' | 'eq' | 'ne';
  threshold: number;
  enabled: boolean;
  notifications: Array<{
    type: 'email' | 'slack' | 'webhook';
    target: string;
  }>;
}

export interface RealtimeUpdate {
  type: 'monitor_update' | 'new_result' | 'alert_fired';
  monitorId: string;
  data: any;
  timestamp: Date;
}

export interface UserPreferences {
  viewMode: ViewMode;
  tableColumns: Record<string, boolean>;
  defaultFilters: Partial<FilterState>;
  refreshInterval: number;
  theme: 'light' | 'dark' | 'auto';
}

// Response body viewer types
export interface ResponseBodyData {
  name: string;
  body: string;
  contentType?: string;
  size?: number;
  timestamp?: Date;
}

// Trend data for sparklines
export interface TrendDataPoint {
  timestamp: Date;
  value: number;
  status?: 'success' | 'error';
}

// Bulk operation types
export interface BulkOperation {
  type: 'export' | 'pause' | 'resume' | 'delete' | 'duplicate';
  monitorIds: string[];
  options?: any;
}

export interface PerformanceMetric {
  label: string;
  value: number | undefined;
  unit: string;
  icon: React.ComponentType;
  trend?: 'up' | 'down' | 'stable';
  changePercent?: number;
}