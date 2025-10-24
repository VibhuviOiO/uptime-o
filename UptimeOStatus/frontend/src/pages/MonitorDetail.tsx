import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  ChevronDown,
  Activity, 
  Clock, 
  Globe, 
  MapPin, 
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  BarChart3,
  LineChart,
  Zap,
  Database,
  Timer,
  RefreshCw,
  Filter,
  Search,
  Network,
  Server,
  X,
  XCircle,
  Eye,
  EyeOff,
  Settings,
  Info,
  Users,
  Shield,
  Bell,
  Play,
  Pause,
  MoreHorizontal,
  Download,
  Share,
  Star,
  AlertTriangle,
  Copy,
  ExternalLink
} from 'lucide-react';

import { MonitorContentDetails } from '@/components/monitoring/components/MonitorContentDetails';
import GenericChart from '@/components/charts/GenericChart';
import RegionMonitoringBarGraph from '@/components/charts/RegionMonitoringBarGraph';
import { useMonitorHistory } from '@/hooks/useMonitors';

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

interface MonitorStats {
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageResponseTime: number;
  uptimePercentage: number;
}

const MonitorDetailContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [monitor, setMonitor] = useState<MonitorDetails | null>(null);
  const [stats, setStats] = useState<MonitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [availabilityTimeRange, setAvailabilityTimeRange] = useState('30m');
  const [customStartDateTime, setCustomStartDateTime] = useState<Date | null>(null);
  const [customEndDateTime, setCustomEndDateTime] = useState<Date | null>(null);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [selectedDatacenters, setSelectedDatacenters] = useState<string[]>(['all']);
  const [hoveredPerfPoint, setHoveredPerfPoint] = useState<number | null>(null);
  const [perfChartMousePos, setPerfChartMousePos] = useState<{ x: number; y: number } | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MonitorHistory | null>(null);
  const [selectedDatacenterRecords, setSelectedDatacenterRecords] = useState<MonitorHistory[] | null>(null);
  
  // Get time range for filtering
  const getTimeRange = React.useCallback(() => {
    const now = new Date();
    let startTime: Date;
    let endTime: Date = now;

    if (availabilityTimeRange === 'custom') {
      if (customStartDateTime && customEndDateTime) {
        startTime = customStartDateTime;
        endTime = customEndDateTime;
      } else {
        // Default to last 24 hours if custom not set
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
    } else {
      // Handle predefined time ranges
      switch (availabilityTimeRange) {
        case '5m':
          startTime = new Date(now.getTime() - 5 * 60 * 1000);
          break;
        case '15m':
          startTime = new Date(now.getTime() - 15 * 60 * 1000);
          break;
        case '30m':
          startTime = new Date(now.getTime() - 30 * 60 * 1000);
          break;
        case '1h':
          startTime = new Date(now.getTime() - 1 * 60 * 60 * 1000);
          break;
        case '4h':
          startTime = new Date(now.getTime() - 4 * 60 * 60 * 1000);
          break;
        case '24h':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '2d':
          startTime = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
    }

    return { startTime, endTime };
  }, [availabilityTimeRange, customStartDateTime, customEndDateTime]);

  // Create filters for API calls based on current state
  const historyFilters = React.useMemo(() => {
    const { startTime, endTime } = getTimeRange();
    const filters: any = {
      startTime,
      endTime,
      limit: 5000, // Increased limit for detailed view
    };

    // Add region filter if not 'all'
    if (!selectedDatacenters.includes('all')) {
      filters.agentRegion = selectedDatacenters.join(',');
    }

    return filters;
  }, [availabilityTimeRange, customStartDateTime, customEndDateTime, selectedDatacenters, getTimeRange]);

  // Use dynamic API calls for monitor history
  const { data: history = [], isLoading: historyLoading, error: historyError } = useMonitorHistory(id || '', historyFilters);

  // Debug: Log when filters change and API is called
  React.useEffect(() => {
    console.log('🔄 MonitorDetail: Filters changed, fetching data:', {
      monitorId: id,
      filters: historyFilters,
      timestamp: new Date().toISOString()
    });
  }, [historyFilters, id]);

  // Debug: Log when data is received
  React.useEffect(() => {
    if (history.length > 0) {
      console.log('✅ MonitorDetail: Data received:', {
        recordCount: history.length,
        regions: [...new Set(history.map(h => h.agentRegion).filter(Boolean))],
        timeRange: historyFilters.startTime && historyFilters.endTime ? 
          `${historyFilters.startTime.toISOString()} - ${historyFilters.endTime.toISOString()}` : 'No time range',
        timestamp: new Date().toISOString()
      });
    }
  }, [history, historyFilters]);

  // Filter history based on time range and region
  const filteredHistory = React.useMemo(() => {
    // Cast the data to MonitorHistory[] since we know the API returns this structure
    return (history as MonitorHistory[]);
  }, [history]);

  // Get unique regions for dropdown
  const uniqueDatacenters = React.useMemo(() => {
    const datacenters = [...new Set(history.map(h => h.agentRegion).filter(Boolean))];
    return datacenters.sort();
  }, [history]);

  // Prepare chart data - organized by time buckets with individual calls
  const chartData = React.useMemo(() => {
    console.log('Computing chartData for filteredHistory:', filteredHistory.length);
    
    if (filteredHistory.length === 0) {
      console.log('Returning empty chartData');
      return { buckets: [], calls: [] };
    }
    
    // Sort history by execution time
    const sortedHistory = [...filteredHistory].sort((a, b) => 
      new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime()
    );
    
    // Determine bucket size based on time range
    let bucketSize: number;
    let bucketLabel: (date: Date) => string;
    
    switch (availabilityTimeRange) {
      case '1h':
        bucketSize = 5 * 60 * 1000; // 5 minutes
        bucketLabel = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        break;
      case '6h':
        bucketSize = 15 * 60 * 1000; // 15 minutes
        bucketLabel = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        break;
      case '24h':
        bucketSize = 60 * 60 * 1000; // 1 hour
        bucketLabel = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        break;
      case '7d':
        bucketSize = 6 * 60 * 60 * 1000; // 6 hours
        bucketLabel = (date) => date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' });
        break;
      case '30d':
        bucketSize = 24 * 60 * 60 * 1000; // 1 day
        bucketLabel = (date) => date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        break;
      default:
        bucketSize = 60 * 60 * 1000; // 1 hour
        bucketLabel = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Create buckets
    const buckets: Array<{
      startTime: Date;
      endTime: Date;
      label: string;
      calls: Array<any>;
      successCount: number;
      failureCount: number;
      warningCount: number;
      criticalCount: number;
    }> = [];
    
    if (sortedHistory.length > 0) {
      const firstTime = new Date(sortedHistory[0].executedAt);
      const lastTime = new Date(sortedHistory[sortedHistory.length - 1].executedAt);
      
      // Round down to bucket boundary
      const startTime = new Date(Math.floor(firstTime.getTime() / bucketSize) * bucketSize);
      const endTime = new Date(Math.ceil(lastTime.getTime() / bucketSize) * bucketSize);
      
      // Create bucket structure
      let currentBucketStart = new Date(startTime);
      while (currentBucketStart < endTime) {
        const bucketEnd = new Date(currentBucketStart.getTime() + bucketSize);
        buckets.push({
          startTime: new Date(currentBucketStart),
          endTime: bucketEnd,
          label: bucketLabel(currentBucketStart),
          calls: [],
          successCount: 0,
          failureCount: 0,
          warningCount: 0,
          criticalCount: 0
        });
        currentBucketStart = bucketEnd;
      }
    }
    
    // Transform each call and assign to buckets
    const allCalls = sortedHistory.map((item, index) => {
      const date = new Date(item.executedAt);
      const warningThreshold = monitor?.warningThresholdMs || 500;
      const criticalThreshold = monitor?.criticalThresholdMs || 1000;
      const responseTime = item.responseTime || 0;
      
      // Determine color and status
      let boxColor: string;
      let status: string;
      
      if (!item.success) {
        boxColor = '#ef4444'; // Red for failed
        status = 'Failed';
      } else if (responseTime >= criticalThreshold) {
        boxColor = '#f97316'; // Orange for critical
        status = 'Critical';
      } else if (responseTime >= warningThreshold) {
        boxColor = '#f59e0b'; // Yellow for warning
        status = 'Warning';
      } else {
        boxColor = '#10b981'; // Green for healthy
        status = 'Healthy';
      }
      
      const call = {
        id: item.id,
        index: index,
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        fullTime: date.toLocaleString(),
        timestamp: item.executedAt,
        responseTime: responseTime,
        success: item.success,
        statusCode: item.responseStatusCode,
        region: item.agentRegion,
        errorType: item.errorType,
        errorMessage: item.errorMessage,
        fill: boxColor,
        status: status,
        warningThreshold: warningThreshold,
        criticalThreshold: criticalThreshold,
      };
      
      // Find appropriate bucket
      const bucketIndex = buckets.findIndex(b => 
        date >= b.startTime && date < b.endTime
      );
      
      if (bucketIndex >= 0) {
        buckets[bucketIndex].calls.push(call);
        if (!item.success) {
          buckets[bucketIndex].failureCount++;
        } else if (responseTime >= criticalThreshold) {
          buckets[bucketIndex].criticalCount++;
        } else if (responseTime >= warningThreshold) {
          buckets[bucketIndex].warningCount++;
        } else {
          buckets[bucketIndex].successCount++;
        }
      }
      
      return call;
    });
    
    return { buckets, calls: allCalls };
  }, [filteredHistory, availabilityTimeRange, monitor]);

  // Compute heatmap data: adaptive grid based on call frequency and time range
  const heatmapData = React.useMemo(() => {
    if (!filteredHistory || filteredHistory.length === 0) {
      console.log('No filtered history for heatmap');
      return { 
        timePeriods: [], 
        rows: [], 
        viewMode: 'minutes',
        lineChartData: [],
        avgResponseTime: []
      };
    }

    console.log('Computing adaptive heatmap data');
    
    // Get time range
    const range = getTimeRange();
    const { startTime: rangeStart, endTime: rangeEnd } = range;
    
    const totalDurationMs = rangeEnd.getTime() - rangeStart.getTime();
    const totalHours = totalDurationMs / (1000 * 60 * 60);
    const totalDays = totalHours / 24;
    
    // Calculate average call frequency
    const avgCallIntervalMs = filteredHistory.length > 1 
      ? totalDurationMs / filteredHistory.length 
      : 60000; // default to 60s
    
    const avgCallIntervalSeconds = avgCallIntervalMs / 1000;
    
    // Determine view mode and granularity based on call frequency and time range
    let viewMode: 'seconds' | 'minutes' | 'hours' | 'days';
    let bucketSizeMs: number;
    let rowCount: number;
    let rowUnit: string;
    let bucketLabel: (date: Date) => string;
    
    // Adaptive logic based on call frequency
    if (avgCallIntervalSeconds <= 30 && totalHours <= 1) {
      // High frequency (≤30s interval) + short range → seconds view
      viewMode = 'seconds';
      bucketSizeMs = 60 * 1000; // 1-minute buckets on X-axis
      rowCount = 60; // 60 seconds on Y-axis
      rowUnit = 's';
      bucketLabel = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (avgCallIntervalSeconds <= 120 && totalHours <= 6) {
      // Medium frequency (≤2min interval) + medium range → minutes view
      viewMode = 'minutes';
      bucketSizeMs = totalHours <= 1 ? 5 * 60 * 1000 : 15 * 60 * 1000;
      rowCount = 60; // 60 minutes on Y-axis
      rowUnit = 'm';
      bucketLabel = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (totalHours <= 48) {
      // Hours view for 1-2 days
      viewMode = 'hours';
      bucketSizeMs = 60 * 60 * 1000; // 1-hour buckets
      rowCount = 24; // 24 hours on Y-axis
      rowUnit = 'h';
      bucketLabel = (date: Date) => date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' });
    } else {
      // Days view for longer periods
      viewMode = 'days';
      bucketSizeMs = 24 * 60 * 60 * 1000; // Daily buckets
      rowCount = 7; // 7 days of week on Y-axis
      rowUnit = 'd';
      bucketLabel = (date: Date) => date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Create time period buckets (X-axis)
    const timePeriods: Array<{
      label: string;
      startTime: Date;
      endTime: Date;
      rowData: Map<number, Array<any>>; // row index -> calls
    }> = [];
    
    let currentTime = new Date(rangeStart);
    while (currentTime < rangeEnd) {
      const bucketEnd = new Date(Math.min(currentTime.getTime() + bucketSizeMs, rangeEnd.getTime()));
      timePeriods.push({
        label: bucketLabel(currentTime),
        startTime: new Date(currentTime),
        endTime: bucketEnd,
        rowData: new Map()
      });
      currentTime = bucketEnd;
    }
    
    // Function to get row index based on view mode
    const getRowIndex = (callTime: Date): number => {
      if (viewMode === 'seconds') {
        return callTime.getSeconds(); // 0-59
      } else if (viewMode === 'minutes') {
        return callTime.getMinutes(); // 0-59
      } else if (viewMode === 'hours') {
        return callTime.getHours(); // 0-23
      } else { // days
        return callTime.getDay(); // 0-6 (Sunday-Saturday)
      }
    };
    
    // Organize calls into time periods and rows
    filteredHistory.forEach(item => {
      const callTime = new Date(item.executedAt);
      const rowIndex = getRowIndex(callTime);
      
      // Find the time period bucket
      const periodIndex = timePeriods.findIndex(p => 
        callTime >= p.startTime && callTime < p.endTime
      );
      
      if (periodIndex >= 0) {
        const period = timePeriods[periodIndex];
        if (!period.rowData.has(rowIndex)) {
          period.rowData.set(rowIndex, []);
        }
        
        const warningThreshold = monitor?.warningThresholdMs || 500;
        const criticalThreshold = monitor?.criticalThresholdMs || 1000;
        const responseTime = item.responseTime || 0;
        
        period.rowData.get(rowIndex)!.push({
          id: item.id,
          time: callTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          fullTime: callTime.toLocaleString(),
          timestamp: item.executedAt,
          responseTime: responseTime,
          success: item.success,
          statusCode: item.responseStatusCode,
          region: item.agentRegion,
          errorType: item.errorType,
          errorMessage: item.errorMessage,
          warningThreshold,
          criticalThreshold
        });
      }
    });
    
    // Get row label based on view mode
    const getRowLabel = (index: number): string => {
      if (viewMode === 'seconds') {
        return index % 10 === 0 ? `${index}s` : '';
      } else if (viewMode === 'minutes') {
        return index % 5 === 0 ? `${index}m` : '';
      } else if (viewMode === 'hours') {
        return `${index.toString().padStart(2, '0')}h`;
      } else { // days
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[index];
      }
    };
    
    // Create rows based on view mode
    const rows = Array.from({ length: rowCount }, (_, rowIndex) => ({
      rowIndex,
      label: getRowLabel(rowIndex),
      unit: rowUnit,
      periods: timePeriods.map(period => ({
        calls: period.rowData.get(rowIndex) || [],
        count: (period.rowData.get(rowIndex) || []).length
      }))
    }));
    
    // Calculate line chart data (average response time per period)
    const lineChartData = timePeriods.map((period, idx) => {
      const allCallsInPeriod: any[] = [];
      period.rowData.forEach(calls => allCallsInPeriod.push(...calls));
      
      const avgResponseTime = allCallsInPeriod.length > 0
        ? allCallsInPeriod.reduce((sum, call) => sum + call.responseTime, 0) / allCallsInPeriod.length
        : 0;
      
      const successRate = allCallsInPeriod.length > 0
        ? (allCallsInPeriod.filter(c => c.success).length / allCallsInPeriod.length) * 100
        : 100;
      
      return {
        periodIndex: idx,
        label: period.label,
        avgResponseTime: Math.round(avgResponseTime),
        successRate: Math.round(successRate * 10) / 10,
        totalCalls: allCallsInPeriod.length,
        timestamp: period.startTime.getTime()
      };
    });
    
    console.log('Heatmap computed:', { 
      viewMode, 
      timePeriods: timePeriods.length, 
      rows: rows.length,
      avgCallInterval: avgCallIntervalSeconds.toFixed(1) + 's'
    });
    
    return { 
      timePeriods, 
      rows, 
      viewMode, 
      lineChartData,
      rowUnit 
    };
  }, [filteredHistory, availabilityTimeRange, monitor]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // The useMonitorHistory hook will automatically refetch when filters change
      setLastRefresh(new Date());
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchMonitorData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Fetch monitor details from the latest history record
      const historyResponse = await fetch(`/api/monitors/history/${id}?limit=1`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        const historyArray = Array.isArray(historyData) ? historyData : [];
        
        // Extract monitor details from the latest history record
        if (historyArray.length > 0) {
          const latestRecord = historyArray[0];
          const transformedMonitor = {
            id: latestRecord.monitorId || parseInt(id),
            monitorName: latestRecord.monitorId || `Monitor ${id}`,
            url: latestRecord.targetHost || 'Unknown URL',
            monitorType: latestRecord.monitorType || 'HTTPS',
            targetHost: latestRecord.targetHost || '',
            targetPath: latestRecord.targetPath || '/',
            frequency: 60, // Default frequency
            enabled: true, // Default enabled
            warningThresholdMs: latestRecord.warningThresholdMs || 500,
            criticalThresholdMs: latestRecord.criticalThresholdMs || 1000,
            createdAt: latestRecord.executedAt || new Date().toISOString(),
            updatedAt: latestRecord.executedAt || new Date().toISOString()
          };
          setMonitor(transformedMonitor);
        }
      }

    } catch (error) {
      console.error('Error fetching monitor data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitorData();
  }, [id]);

  // Combined loading state
  const isLoading = loading || historyLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Loading monitor details...</p>
        </div>
      </div>
    );
  }

  if (!monitor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <p className="text-muted-foreground">Monitor not found</p>
          <Button variant="outline" onClick={() => navigate('/monitors')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Monitors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-8xl py-5 mx-auto space-y-8">
        {/* Header Section - Title, Metadata, and URL */}
        <div className="bg-white backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 p-8">
          {/* Row 1: Back Button, Title and Controls */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/monitors')}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <div>
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25 flex-shrink-0">
                      <Server className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent tracking-tight mb-1">
                        {monitor.monitorName || `Monitor ${id}`}
                      </h1>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        Real-time monitoring dashboard with performance metrics
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={(e) => {
                  e.preventDefault();
                  setAutoRefresh(!autoRefresh);
                }}
                className={`${autoRefresh ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100' : 'hover:bg-gray-50'}`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </Button>
            </div>
          </div>
          
          {/* Row 2: Monitor Metadata */}
          <div className="flex items-center gap-6 text-sm mb-8">
            <div className="flex items-center gap-2 text-gray-600">
              <Network className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Method:</span>
              <Badge variant="secondary" className="font-medium">GET</Badge>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Protocol:</span>
              <Badge variant="outline" className="font-medium">
                {monitor.monitorType?.toUpperCase() || 'HTTPS'}
              </Badge>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Regions:</span>
              <span className="font-medium text-gray-900">
                {(() => {
                  const uniqueDatacenters = [...new Set(history.map(h => h.agentRegion).filter(Boolean))];
                  return uniqueDatacenters.length;
                })()}
              </span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Interval:</span>
              <span className="font-medium text-gray-900">30s</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2 text-gray-600">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Uptime:</span>
              <span className="font-medium text-green-700">
                {(() => {
                  const successCount = filteredHistory.filter(h => h.success).length;
                  const totalCount = filteredHistory.length;
                  const uptime = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(2) : '100.00';
                  return `${uptime}%`;
                })()}
              </span>
            </div>
          </div>
          
          {/* Row 3: Monitoring URL - Terminal Style */}
          <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-600 text-xs font-semibold uppercase tracking-wider">Endpoint</span>
                </div>
                <code className="text-gray-800 text-sm font-mono flex-1 truncate">
                  {(() => {
                    // Always construct complete URL from monitorType, targetHost, and targetPath
                    const protocol = (monitor.monitorType || 'http').toLowerCase();
                    const host = monitor.targetHost || monitor.url;
                    const path = monitor.targetPath || '/';
                    
                    // If we have targetHost, construct full URL
                    if (monitor.targetHost) {
                      const constructedUrl = `${protocol}://${host}${path}`;
                      return constructedUrl;
                    }
                    
                    // Otherwise use the url field
                    return monitor.url;
                  })()}
                </code>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                  onClick={() => {
                    const protocol = (monitor.monitorType || 'http').toLowerCase();
                    const host = monitor.targetHost || monitor.url;
                    const path = monitor.targetPath || '/';
                    const urlToCopy = monitor.targetHost 
                      ? `${protocol}://${host}${path}`
                      : monitor.url;
                    navigator.clipboard.writeText(urlToCopy);
                  }}
                  title="Copy URL"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                  onClick={() => {
                    const protocol = (monitor.monitorType || 'http').toLowerCase();
                    const host = monitor.targetHost || monitor.url;
                    const path = monitor.targetPath || '/';
                    const urlToOpen = monitor.targetHost 
                      ? `${protocol}://${host}${path}`
                      : monitor.url;
                    window.open(urlToOpen, '_blank');
                  }}
                  title="Open URL in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Filters and Charts */}
        <div className="space-y-8">
          {/* Time Range Filter */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-1 flex-wrap">
                <Button
                  type="button"
                  variant={availabilityTimeRange === '5m' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAvailabilityTimeRange('5m');
                  }}
                  className="text-xs h-8"
                >
                  5 MIN
                </Button>
                <Button
                  type="button"
                  variant={availabilityTimeRange === '15m' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAvailabilityTimeRange('15m');
                  }}
                  className="text-xs h-8"
                >
                  15 MIN
                </Button>
                <Button
                  type="button"
                  variant={availabilityTimeRange === '30m' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAvailabilityTimeRange('30m');
                  }}
                  className="text-xs h-8"
                >
                  30 MIN
                </Button>
                <Button
                  type="button"
                  variant={availabilityTimeRange === '1h' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAvailabilityTimeRange('1h');
                  }}
                  className="text-xs h-8"
                >
                  1 HOUR
                </Button>
                <Button
                  type="button"
                  variant={availabilityTimeRange === '4h' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAvailabilityTimeRange('4h');
                  }}
                  className="text-xs h-8"
                >
                  4 HOURS
                </Button>
                <Button
                  type="button"
                  variant={availabilityTimeRange === '24h' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAvailabilityTimeRange('24h');
                  }}
                  className="text-xs h-8"
                >
                  24 HOURS
                </Button>
                <Button
                  type="button"
                  variant={availabilityTimeRange === '2d' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAvailabilityTimeRange('2d');
                  }}
                  className="text-xs h-8"
                >
                  2 DAYS
                </Button>
                <Button
                  type="button"
                  variant={availabilityTimeRange === '7d' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAvailabilityTimeRange('7d');
                  }}
                  className="text-xs h-8"
                >
                  1 WEEK
                </Button>
                <Button
                  type="button"
                  variant={availabilityTimeRange === '30d' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAvailabilityTimeRange('30d');
                  }}
                  className="text-xs h-8"
                >
                  1 MONTH
                </Button>
              </div>
              
              {/* Region Multi-Select Filter */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-gray-400">
                  Regions:
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs min-w-[200px] justify-between"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <span className="truncate">
                        {selectedDatacenters.includes('all')
                          ? 'All Regions'
                          : selectedDatacenters.length === 0
                          ? 'Select regions'
                          : selectedDatacenters.length === 1
                          ? selectedDatacenters[0]
                          : `${selectedDatacenters.length} selected`}
                      </span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0" align="start">
                    <div className="p-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="all-regions"
                          checked={selectedDatacenters.includes('all')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedDatacenters(['all']);
                            } else {
                              setSelectedDatacenters([]);
                            }
                          }}
                        />
                        <Label
                          htmlFor="all-regions"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          All Regions
                        </Label>
                      </div>
                      {uniqueDatacenters.map((datacenter) => (
                        <div key={datacenter} className="flex items-center space-x-2 mt-2">
                          <Checkbox
                            id={datacenter}
                            checked={selectedDatacenters.includes(datacenter)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                if (selectedDatacenters.includes('all')) {
                                  setSelectedDatacenters([datacenter]);
                                } else {
                                  setSelectedDatacenters([...selectedDatacenters, datacenter]);
                                }
                              } else {
                                setSelectedDatacenters(selectedDatacenters.filter(d => d !== datacenter));
                              }
                            }}
                          />
                          <Label
                            htmlFor={datacenter}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {datacenter}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Comparison Line Chart */}
        <Card className="bg-white border-0 shadow-xl shadow-slate-200/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-slate-300/60 transition-all duration-500 overflow-hidden">
          <CardHeader className="pb-6 relative z-10">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
                    Region Performance Comparison
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600 font-medium leading-relaxed">
                    Response time trends across regions with threshold indicators
                  </CardDescription>
                </div>
              </div>

              {/* Legend Section */}
              <div className="flex flex-col gap-3 flex-shrink-0">
                {/* Region Legend */}
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-widest mr-2">Regions:</span>
                  {(() => {
                    const uniqueDatacenters = Array.from(
                      new Set(filteredHistory.map(item => item.agentRegion).filter(Boolean))
                    ).sort();

                    const datacenterColors = [
                      '#3b82f6', // blue
                      '#10b981', // green
                      '#f59e0b', // amber
                      '#8b5cf6', // purple
                      '#ec4899', // pink
                      '#06b6d4', // cyan
                      '#f97316', // orange
                    ];

                    return uniqueDatacenters.map((dc, index) => (
                      <div key={dc} className="flex items-center gap-1.5 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                        <div
                          className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-white"
                          style={{ backgroundColor: datacenterColors[index % datacenterColors.length] }}
                        ></div>
                        <span className="text-slate-700 font-semibold text-xs whitespace-nowrap">{dc}</span>
                      </div>
                    ));
                  })()}
                </div>

                {/* Threshold Legend */}
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-widest mr-2">Thresholds:</span>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/60 shadow-sm">
                    <div className="w-3 h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"></div>
                    <span className="text-slate-700 font-semibold text-xs">Warning</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/60 shadow-sm">
                    <div className="w-3 h-0.5 bg-gradient-to-r from-red-400 to-red-500 rounded-full"></div>
                    <span className="text-slate-700 font-semibold text-xs">Critical</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          {/* Separator Line */}
          <div className="relative z-10 px-6 mb-6">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-slate-300/80 to-transparent"></div>
          </div>
          
          <CardContent className="relative z-10">
            {(() => {
              const warningThreshold = monitor?.warningThresholdMs || 500;
              const criticalThreshold = monitor?.criticalThresholdMs || 1000;

              // Get unique regions
              const uniqueDatacenters = Array.from(
                new Set(filteredHistory.map(item => item.agentRegion).filter(Boolean))
              ).sort();

              // Generate colors for each region
              const datacenterColors = [
                '#3b82f6', // blue
                '#10b981', // green
                '#f59e0b', // amber
                '#8b5cf6', // purple
                '#ec4899', // pink
                '#06b6d4', // cyan
                '#f97316', // orange
              ];

              // Create time buckets
              const { startTime, endTime } = getTimeRange();
              const timeRange = endTime.getTime() - startTime.getTime();
              const numBuckets = 50;
              const bucketSize = timeRange / numBuckets;

              // Prepare data points for each region
              const lineChartData = Array.from({ length: numBuckets }, (_, i) => {
                const bucketStart = startTime.getTime() + (i * bucketSize);
                const bucketEnd = bucketStart + bucketSize;

                const dataPoint: any = {
                  time: new Date(bucketStart).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  }),
                  warningThreshold,
                  criticalThreshold,
                };

                // Calculate average response time for each region in this bucket
                uniqueDatacenters.forEach((dc) => {
                  const dcRecords = filteredHistory.filter(record => {
                    const recordTime = new Date(record.executedAt).getTime();
                    return record.agentRegion === dc &&
                           recordTime >= bucketStart &&
                           recordTime < bucketEnd &&
                           record.success &&
                           record.responseTime;
                  });

                  if (dcRecords.length > 0) {
                    const avgResponseTime = dcRecords.reduce((sum, r) => sum + (r.responseTime || 0), 0) / dcRecords.length;
                    dataPoint[dc!] = Math.round(avgResponseTime);
                  } else {
                    dataPoint[dc!] = null;
                  }
                });

                return dataPoint;
              });

              return (
                <GenericChart
                  type="line"
                  data={lineChartData}
                  xKey="time"
                  yKeys={uniqueDatacenters}
                  colors={datacenterColors}
                  height={220}
                  showThresholds={true}
                  warningThreshold={warningThreshold}
                  criticalThreshold={criticalThreshold}
                  yAxisLabel="Response Time (ms)"
                />
              );
            })()}
          </CardContent>
        </Card>

        {/* Monitor Cards Grouped by Region */}
        <div className="space-y-6 mt-8">
          {(() => {
            // Group history by region
            const datacenterGroups = filteredHistory.reduce((acc, record) => {
              const dc = record.agentRegion || 'unknown';
              if (!acc[dc]) {
                acc[dc] = [];
              }
              acc[dc].push(record);
              return acc;
            }, {} as Record<string, MonitorHistory[]>);

            return Object.entries(datacenterGroups).map(([datacenter, records]) => {
              // Calculate metrics for this region
              const successCount = records.filter(r => r.success).length;
              const totalCount = records.length;
              const availability = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(0) : '100';

              // Calculate percentiles
              const responseTimes = records
                .filter(r => r.responseTime)
                .map(r => r.responseTime || 0)
                .sort((a, b) => a - b);

              const p95Index = Math.floor(responseTimes.length * 0.95);
              const p99Index = Math.floor(responseTimes.length * 0.99);
              const p95 = responseTimes[p95Index] || 0;
              const p99 = responseTimes[p99Index] || 0;

              // Determine if there are any issues
              const hasFailures = successCount < totalCount;
              const warningThreshold = monitor?.warningThresholdMs || 500;
              const criticalThreshold = monitor?.criticalThresholdMs || 1000;
              const hasSlowResponses = p99 > warningThreshold;

              // Calculate status counts
              let healthyCount = 0;
              let warningCount = 0;
              let criticalCount = 0;
              let failedCount = 0;

              records.forEach(r => {
                if (!r.success) {
                  failedCount++;
                } else {
                  const rt = r.responseTime || 0;
                  if (rt >= criticalThreshold) {
                    criticalCount++;
                  } else if (rt >= warningThreshold) {
                    warningCount++;
                  } else {
                    healthyCount++;
                  }
                }
              });

              // Calculate change percentage (mock for now)
              const changePercent = '+0.1';

              return (
                <div
                  key={datacenter}
                  className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/60 transition-all duration-500 overflow-hidden group backdrop-blur-sm"
                >
                  {/* Header Row */}
                  <div className="relative z-10 p-6 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                              {datacenter}
                            </h2>
                            <div
                              className={`w-5 h-5 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                                hasFailures
                                  ? "bg-gradient-to-br from-red-400 to-red-600 shadow-red-200"
                                  : "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-200"
                              }`}
                            >
                              {hasFailures ? (
                                <XCircle className="w-4 h-4 text-white drop-shadow-sm" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-white drop-shadow-sm" />
                              )}
                            </div>
                          </div>

                          {/* Status Counts Row - Combined with total */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-2">
                              {healthyCount > 0 && (
                                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm ring-2 ring-emerald-100"></div>
                                  <span className="text-sm text-emerald-800 font-bold">
                                    {healthyCount}
                                  </span>
                                  <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">
                                    Healthy
                                  </span>
                                </div>
                              )}
                              {warningCount > 0 && (
                                <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm ring-2 ring-amber-100"></div>
                                  <span className="text-sm text-amber-800 font-bold">
                                    {warningCount}
                                  </span>
                                  <span className="text-xs text-amber-700 font-semibold uppercase tracking-wide">
                                    Warning
                                  </span>
                                </div>
                              )}
                              {criticalCount > 0 && (
                                <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl border border-orange-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                                  <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm ring-2 ring-orange-100"></div>
                                  <span className="text-sm text-orange-800 font-bold">
                                    {criticalCount}
                                  </span>
                                  <span className="text-xs text-orange-700 font-semibold uppercase tracking-wide">
                                    Critical
                                  </span>
                                </div>
                              )}
                              {failedCount > 0 && (
                                <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl border border-red-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm ring-2 ring-red-100"></div>
                                  <span className="text-sm text-red-800 font-bold">
                                    {failedCount}
                                  </span>
                                  <span className="text-xs text-red-700 font-semibold uppercase tracking-wide">
                                    Failed
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons Row */}
                          <div className="flex items-center gap-3">
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedDatacenterRecords(records);
                                setSelectedRecord(null); // Clear any previous selection
                              }}
                              className="text-sm px-4 py-2 h-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
                            >
                              View History
                            </Button>
                            <Badge
                              variant="secondary"
                              className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 border-0 rounded-lg shadow-sm"
                            >
                              {(() => {
                                const agentId =
                                  records.length > 0 && records[0].agentId
                                    ? records[0].agentId
                                    : `${datacenter}-agent`;
                                return agentId;
                              })()}
                            </Badge>
                            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/50">
                              <Clock className="w-4 h-4 text-slate-500" />
                              <span className="font-medium">
                                {(() => {
                                  if (records.length === 0)
                                    return "No recent checks";
                                  const latest = records[0];
                                  const now = new Date();
                                  const executedAt = new Date(
                                    latest.executedAt
                                  );
                                  const diffMs =
                                    now.getTime() - executedAt.getTime();
                                  const diffMins = Math.floor(
                                    diffMs / (1000 * 60)
                                  );

                                  if (diffMins < 1) return "Just now";
                                  if (diffMins < 60)
                                    return `${diffMins} minute${
                                      diffMins !== 1 ? "s" : ""
                                    } ago`;
                                  const diffHours = Math.floor(diffMins / 60);
                                  return `${diffHours} hour${
                                    diffHours !== 1 ? "s" : ""
                                  } ago`;
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side Metrics */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Checks Metric */}
                        <div className="group/metric">
                          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200/50 shadow-sm hover:shadow-lg hover:shadow-slate-200/25 transition-all duration-300 hover:scale-105">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg shadow-slate-500/25">
                                <Activity className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-xs text-slate-700 uppercase font-bold tracking-widest">Checks</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900 mb-1">
                              {totalCount}
                            </div>
                            <div className="text-xs text-slate-600 font-semibold">
                              Total requests
                            </div>
                          </div>
                        </div>

                        {/* Availability Metric */}
                        <div className="group/metric">
                          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200/50 shadow-sm hover:shadow-lg hover:shadow-slate-200/25 transition-all duration-300 hover:scale-105">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg shadow-slate-500/25">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-xs text-slate-700 uppercase font-bold tracking-widest">Availability</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900 mb-1">
                              {availability}
                              <span className="text-lg font-bold text-slate-600 ml-1">%</span>
                            </div>
                            <div className="text-xs text-slate-600 font-semibold">
                              Uptime
                            </div>
                          </div>
                        </div>

                        {/* P95 Metric */}
                        <div className="group/metric">
                          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200/50 shadow-sm hover:shadow-lg hover:shadow-slate-200/25 transition-all duration-300 hover:scale-105">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg shadow-slate-500/25">
                                <TrendingUp className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-xs text-slate-700 uppercase font-bold tracking-widest">P95</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900 mb-1">
                              {p95}
                              <span className="text-lg font-bold text-slate-600 ml-1">ms</span>
                            </div>
                            <div className="text-xs text-slate-600 font-semibold">
                              95th percentile
                            </div>
                          </div>
                        </div>

                        {/* P99 Metric */}
                        <div className="group/metric relative">
                          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200/50 shadow-sm hover:shadow-lg hover:shadow-slate-200/25 transition-all duration-300 hover:scale-105">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg shadow-slate-500/25">
                                <AlertTriangle className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-700 uppercase font-bold tracking-widest">P99</span>
                                {hasSlowResponses && (
                                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white text-xs font-black rounded-md border border-red-400/50 shadow-sm animate-pulse">
                                    <TrendingUp className="w-2.5 h-2.5" />
                                    <span>{changePercent}%</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-2xl font-black text-slate-900 mb-1">
                              {p99}
                              <span className="text-lg font-bold text-slate-600 ml-1">ms</span>
                            </div>
                            <div className="text-xs text-slate-600 font-semibold">
                              99th percentile
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Separator Line */}
                  <div className="relative z-10 px-6 mb-6">
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-slate-300/80 to-transparent"></div>
                  </div>

                  {/* Bar Chart Visualization */}
                  <div className="relative px-6 pb-6">
                    <RegionMonitoringBarGraph
                      records={records}
                      availabilityTimeRange={availabilityTimeRange}
                      monitor={monitor}
                      height={140}
                    />
                  </div>
                </div>
              );
            });
          })()}
        </div>        {/* Modal for Selected Record Details */}
        <MonitorContentDetails
          records={selectedDatacenterRecords || []}
          monitor={monitor}
          isOpen={!!selectedDatacenterRecords}
          onClose={() => setSelectedDatacenterRecords(null)}
          initialSelectedRecord={selectedRecord}
        />
      </div>
    </DashboardLayout>
  );
};

export default function MonitorDetail() {
  return <MonitorDetailContent />;
}
