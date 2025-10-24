import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  LayoutDashboard,
  Grid3X3,
  Search,
  Activity,
  CheckCircle,
  AlertTriangle,
  Timer,
  Filter,
  SortAsc,
  SortDesc,
  ExternalLink,
  Eye,
  MoreVertical,
  MapPin,
  Globe,
  X,
  Network,
  Server,
  Zap
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Import the dedicated MonitorFilters component
import { MonitorFilters } from '../components/monitoring/components/MonitorFilters';
import { Monitor, usePINGMonitors } from "../hooks/useMonitors";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

// Import types from monitoring module
import { 
  FilterState, 
  SortConfig, 
  ViewMode
} from '../components/monitoring/types';

// PING Monitor extends Monitor with PING-specific fields  
interface PINGMonitor extends Monitor {
  // PING specific fields already in Monitor interface
  packetLoss?: number | null;
  jitterMs?: number | null;
}

interface ResponseBodyData {
  name: string;
  body: string;
  contentType?: string;
  size?: number;
  timestamp: Date;
}

// Transform Monitor data to PINGMonitor for our components
const transformMonitorData = (monitors: Monitor[]): PINGMonitor[] => {
  return monitors.filter(m => m.monitorType === 'PING') as PINGMonitor[];
};

// Hexagon component for hive display
const HexagonTile: React.FC<{ monitor: PINGMonitor; onClick: () => void }> = ({ monitor, onClick }) => {
  const getStatusColor = () => {
    if (!monitor.success) return 'bg-red-500 border-red-600';
    
    const responseTime = monitor.responseTime || 0;
    if (responseTime < 50) return 'bg-green-500 border-green-600';
    if (responseTime < 100) return 'bg-lime-500 border-lime-600';
    if (responseTime < 200) return 'bg-yellow-500 border-yellow-600';
    if (responseTime < 500) return 'bg-orange-500 border-orange-600';
    return 'bg-red-500 border-red-600';
  };

  const displayName = monitor.monitorName || monitor.monitorId.split('-')[0];
  const colorClasses = getStatusColor();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`
              w-24 h-24 ${colorClasses} cursor-pointer 
              transition-all duration-200 hover:scale-110 hover:brightness-110
              flex flex-col items-center justify-center text-white text-xs font-semibold
              border-2 shadow-lg hover:shadow-xl
            `}
            style={{ 
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
              margin: '8px'
            }}
            onClick={onClick}
          >
            <div className="text-center leading-tight">
              <div className="font-bold text-xs truncate w-16" title={displayName}>
                {displayName.length > 8 ? `${displayName.slice(0,6)}..` : displayName}
              </div>
              <div className="text-xs opacity-90 mt-1">
                {monitor.success ? `${monitor.responseTime}ms` : 'FAIL'}
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-gray-800 border-gray-700">
          <div className="text-sm">
            <div className="font-semibold text-white">{monitor.monitorName || monitor.monitorId}</div>
            <div className="text-gray-300 mt-1">Target: {monitor.targetHost}</div>
            <div className="text-gray-300">Region: {monitor.agentRegion}</div>
            <div className="text-gray-300">
              Status: {monitor.success ? 
                `✓ ${monitor.responseTime}ms` : 
                '✗ Failed'
              }
            </div>
            {monitor.packetLoss !== null && monitor.packetLoss !== undefined && (
              <div className="text-gray-300">Packet Loss: {monitor.packetLoss}%</div>
            )}
            {monitor.jitterMs !== null && monitor.jitterMs !== undefined && (
              <div className="text-gray-300">Jitter: {monitor.jitterMs}ms</div>
            )}
            <div className="text-gray-400 text-xs mt-1">
              Last check: {new Date(monitor.executedAt).toLocaleTimeString()}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const PINGMonitorsContent: React.FC = () => {
  const navigate = useNavigate();
  const { data: monitors = [], isLoading, error, refetch } = usePINGMonitors();
  
  // Convert Monitor[] to PINGMonitor[] for our components
  const pingMonitors = transformMonitorData(monitors);
  
  // State management
  const [selectedResponseBody, setSelectedResponseBody] = useState<ResponseBodyData | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    method: 'all',
    region: 'all',
    responseTime: 'all',
    showActiveOnly: true,
    activeWindow: 5
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'executedAt', direction: 'desc' });
  const [preferences, setPreferences] = useState({ viewMode: 'grid' as ViewMode, exportFormat: 'csv' as const });
  
  // Filtering logic
  const filteredMonitors = useMemo(() => {
    let filtered = pingMonitors;

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(monitor => 
        (monitor.monitorName || monitor.monitorId).toLowerCase().includes(searchTerm) ||
        monitor.targetHost.toLowerCase().includes(searchTerm) ||
        monitor.monitorId.toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'healthy') {
        filtered = filtered.filter(monitor => monitor.success);
      } else if (filters.status === 'error') {
        filtered = filtered.filter(monitor => !monitor.success);
      }
    }

    // PING doesn't have methods like HTTP, so skip method filtering

    // Region filter
    if (filters.region !== 'all') {
      filtered = filtered.filter(monitor => monitor.agentRegion === filters.region);
    }

    // Response time filter
    if (filters.responseTime !== 'all') {
      filtered = filtered.filter(monitor => {
        const rt = monitor.responseTime || 0;
        const warningThreshold = monitor.warningThresholdMs || 500;
        const criticalThreshold = monitor.criticalThresholdMs || 1000;
        
        switch (filters.responseTime) {
          case 'healthy': return monitor.success && rt < warningThreshold;
          case 'warning': return monitor.success && rt >= warningThreshold && rt < criticalThreshold;
          case 'critical': return monitor.success && rt >= criticalThreshold;
          case 'failed': return !monitor.success;
          default: return true;
        }
      });
    }

    // Time window filter (show only recent monitors)
    if (filters.showActiveOnly) {
      const cutoffTime = Date.now() - (filters.activeWindow * 60 * 1000);
      filtered = filtered.filter(monitor => {
        const executedTime = new Date(monitor.executedAt).getTime();
        return executedTime >= cutoffTime;
      });
    }

    // Apply sorting
    const sortedFiltered = [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.field as keyof PINGMonitor];
      const bVal = b[sortConfig.field as keyof PINGMonitor];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }
      
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sortedFiltered;
  }, [pingMonitors, filters, sortConfig]);

  // Derived values for unique filters
  const uniqueRegions = useMemo(() => {
    const regions = new Set(pingMonitors.map(m => m.agentRegion).filter(Boolean));
    return Array.from(regions).sort();
  }, [pingMonitors]);

  const uniqueMethods: string[] = []; // PING doesn't have methods

  // Event handlers
  const handleNavigateToMonitor = useCallback((monitorId: string) => {
    navigate(`/monitors/${monitorId}`);
  }, [navigate]);

  const handleViewResponseBody = useCallback((data: ResponseBodyData) => {
    setSelectedResponseBody(data);
  }, []);

  const handleExport = useCallback(async () => {
    try {
      // Implementation for export functionality
      console.log('Export functionality not yet implemented');
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setPreferences(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const handleFiltersChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const updateSort = useCallback((field: keyof PINGMonitor) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading PING Monitors</h3>
        <p className="text-muted-foreground mb-4">
          Failed to load PING monitoring data. Please try again.
        </p>
        <Button onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PING Monitors</h1>
            <p className="text-muted-foreground">
              Network connectivity and latency monitoring
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Monitors</p>
                <p className="text-2xl font-bold">{pingMonitors.length}</p>
              </div>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Healthy</p>
                <p className="text-2xl font-bold text-green-600">
                  {pingMonitors.filter(m => m.success).length}
                </p>
              </div>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {pingMonitors.filter(m => !m.success).length}
                </p>
              </div>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">
                  {pingMonitors.length > 0 ? Math.round(pingMonitors.reduce((sum, m) => sum + (m.responseTime || 0), 0) / pingMonitors.length) : 0}ms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monitors Content */}
      <div className="space-y-6">
          {/* Filters - Using dedicated MonitorFilters component */}
          <MonitorFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            uniqueRegions={uniqueRegions}
            uniqueMethods={uniqueMethods}
            viewMode={preferences.viewMode}
            onViewModeChange={handleViewModeChange}
            onRefresh={handleRefresh}
          />

          {/* Results Count */}
          <div className="flex justify-end">
            <div className="text-sm text-muted-foreground">
              Showing {filteredMonitors.length} of {pingMonitors.length} monitors
            </div>
          </div>

          {/* Hexagon Hive Display */}
          {filteredMonitors.length === 0 && pingMonitors.length > 0 && (
            <Card className="p-12 text-center">
              <div className="space-y-3">
                <Filter className="w-12 h-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">No monitors match your filters</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or clearing filters
                </p>
                <Button variant="outline" onClick={() => handleFiltersChange({
                  search: '',
                  status: 'all',
                  method: 'all',
                  region: 'all',
                  responseTime: 'all',
                  showActiveOnly: true,
                  activeWindow: 5
                })}>
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            </Card>
          )}

          {/* No Data State */}
          {pingMonitors.length === 0 && (
            <Card className="p-12 text-center">
              <div className="space-y-3">
                <Network className="w-12 h-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">No PING monitors found</h3>
                <p className="text-muted-foreground">
                  There are currently no PING monitoring configurations set up.
                </p>
              </div>
            </Card>
          )}

          {/* Hexagon Display */}
          {filteredMonitors.length > 0 && (
            <div className="space-y-4">
              {/* Status Legend */}
              <div className="flex justify-center">
                <div className="flex flex-wrap justify-center gap-4 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 bg-green-500 border border-green-600"
                      style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }}
                    ></div>
                    <span className="text-green-600">&lt; 50ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 bg-lime-500 border border-lime-600"
                      style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }}
                    ></div>
                    <span className="text-lime-600">50-100ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 bg-yellow-500 border border-yellow-600"
                      style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }}
                    ></div>
                    <span className="text-yellow-600">100-200ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 bg-orange-500 border border-orange-600"
                      style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }}
                    ></div>
                    <span className="text-orange-600">200-500ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 bg-red-500 border border-red-600"
                      style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }}
                    ></div>
                    <span className="text-red-600">&gt; 500ms or Failed</span>
                  </div>
                </div>
              </div>

              {/* Hexagon Grid */}
              <Card className="p-8">
                <div className="flex flex-wrap justify-center items-center gap-2">
                  {filteredMonitors.map((monitor) => (
                    <HexagonTile
                      key={monitor.id}
                      monitor={monitor}
                      onClick={() => handleNavigateToMonitor(monitor.monitorId)}
                    />
                  ))}
                </div>
              </Card>
            </div>
          )}
      </div>
    </div>
  );
};

const PINGMonitors: React.FC = () => {
  return (
    <DashboardLayout>
      <PINGMonitorsContent />
    </DashboardLayout>
  );
};

export default PINGMonitors;