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
  Server
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
import { useTCPMonitors, type Monitor } from "../hooks/useMonitors";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

// Import types from monitoring module
import { 
  FilterState, 
  SortConfig, 
  ViewMode
} from '../components/monitoring/types';

// TCP Monitor extends Monitor with TCP-specific fields
interface TCPMonitor extends Monitor {
  monitorType: 'TCP';
  targetPort: number;
}

interface ResponseBodyData {
  name: string;
  body: string;
  contentType?: string | null;
  size?: number | null;
  timestamp: Date;
}

// Transform Monitor data to TCPMonitor for our components
const transformMonitorData = (monitors: Monitor[]): TCPMonitor[] => {
  return monitors.filter(m => m.monitorType === 'TCP') as TCPMonitor[];
};

const TCPMonitorsContent: React.FC = () => {
  const navigate = useNavigate();
  const { data: monitors = [], isLoading, error, refetch } = useTCPMonitors();
  
  // Convert Monitor[] to TCPMonitor[] for our components
  const tcpMonitors = transformMonitorData(monitors);
  
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
  const [preferences, setPreferences] = useState({ viewMode: 'table' as ViewMode, exportFormat: 'csv' as const });
  
  // Filtering logic
  const filteredMonitors = useMemo(() => {
    let filtered = tcpMonitors;

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(monitor => 
        (monitor.monitorName || monitor.monitorId).toLowerCase().includes(searchTerm) ||
        monitor.targetHost.toLowerCase().includes(searchTerm) ||
        monitor.monitorId.toLowerCase().includes(searchTerm) ||
        monitor.targetPort.toString().includes(searchTerm)
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

    // TCP doesn't have methods like HTTP, so skip method filtering

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
      const aVal = a[sortConfig.field];
      const bVal = b[sortConfig.field];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' 
          ? aVal - bVal
          : bVal - aVal;
      }
      
      return 0;
    });

    return sortedFiltered;
  }, [tcpMonitors, filters, sortConfig]);

  const isConnected = true; // Placeholder for real-time connection

  // Get unique values for filter options
  const uniqueRegions = useMemo(() => 
    [...new Set(tcpMonitors.map(m => m.agentRegion).filter(Boolean))], 
    [tcpMonitors]
  );
  
  const uniqueMethods: string[] = []; // TCP doesn't have HTTP methods  // Event handlers
  const handleNavigateToMonitor = useCallback((monitorId: string) => {
    navigate(`/monitors/${monitorId}`);
  }, [navigate]);

  const handleShowResponseBody = useCallback((data: ResponseBodyData) => {
    setSelectedResponseBody(data);
  }, []);

  const handleExportMonitor = useCallback(async (monitor: TCPMonitor) => {
    try {
      console.log('Export functionality will be implemented with full monitoring system');
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

  const updateSort = useCallback((field: keyof TCPMonitor) => {
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
      <Card className="p-12 text-center">
        <div className="space-y-3">
          <div className="text-red-500 text-lg font-semibold">Error loading monitors</div>
          <p className="text-muted-foreground">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Network className="w-8 h-8 text-blue-500" />
            TCP Monitors
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor TCP connection health and performance across your infrastructure
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span>{isConnected ? 'Live' : 'Offline'}</span>
          </div>
          
          <Button variant="outline" onClick={() => refetch()} size="sm">
            <Search className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Monitors</p>
                <p className="text-2xl font-semibold">{tcpMonitors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Healthy</p>
                <p className="text-2xl font-semibold">{tcpMonitors.filter(m => m.success).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issues</p>
                <p className="text-2xl font-semibold">{tcpMonitors.filter(m => !m.success).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                <Timer className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-semibold">
                  {tcpMonitors.length > 0 ? Math.round(tcpMonitors.reduce((sum, m) => sum + (m.responseTime || 0), 0) / tcpMonitors.length) : 0}ms
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
              Showing {filteredMonitors.length} of {tcpMonitors.length} monitors
            </div>
          </div>

          {/* Monitor Display */}
          {preferences.viewMode === 'grid' ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredMonitors.map(monitor => (
                <Card 
                  key={monitor.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleNavigateToMonitor(monitor.monitorId)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{monitor.monitorName || monitor.monitorId}</h3>
                      <p className="text-sm text-muted-foreground mb-3 font-mono">
                        {monitor.targetHost}:{monitor.targetPort}
                      </p>                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${monitor.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span>{monitor.success ? 'Healthy' : 'Down'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Timer className="w-3 h-3" />
                            <span>{monitor.responseTime || 0}ms</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span className="text-muted-foreground">{monitor.agentRegion || 'unknown'}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            TCP Connection
                          </Badge>

                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge 
                          variant={monitor.success ? "default" : "destructive"} 
                          className={monitor.success ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {monitor.success ? 'Connected' : 'Failed'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Table View */
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => updateSort('monitorId')}
                      >
                        <div className="flex items-center">
                          Monitor Name
                          {sortConfig.field === 'monitorId' && (
                            sortConfig.direction === 'asc' ? 
                              <SortAsc className="w-3 h-3 ml-1" /> : 
                              <SortDesc className="w-3 h-3 ml-1" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => updateSort('success')}
                      >
                        <div className="flex items-center">
                          Status
                          {sortConfig.field === 'success' && (
                            sortConfig.direction === 'asc' ? 
                              <SortAsc className="w-3 h-3 ml-1" /> : 
                              <SortDesc className="w-3 h-3 ml-1" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          Type
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => updateSort('agentRegion')}
                      >
                        <div className="flex items-center">
                          Region
                          {sortConfig.field === 'agentRegion' && (
                            sortConfig.direction === 'asc' ? 
                              <SortAsc className="w-3 h-3 ml-1" /> : 
                              <SortDesc className="w-3 h-3 ml-1" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => updateSort('responseTime')}
                      >
                        <div className="flex items-center">
                          Response Time
                          {sortConfig.field === 'responseTime' && (
                            sortConfig.direction === 'asc' ? 
                              <SortAsc className="w-3 h-3 ml-1" /> : 
                              <SortDesc className="w-3 h-3 ml-1" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => updateSort('executedAt')}
                      >
                        <div className="flex items-center">
                          Last Check
                          {sortConfig.field === 'executedAt' && (
                            sortConfig.direction === 'asc' ? 
                              <SortAsc className="w-3 h-3 ml-1" /> : 
                              <SortDesc className="w-3 h-3 ml-1" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMonitors.map((monitor) => {
                      const lastCheck = new Date(monitor.executedAt);
                      const target = `${monitor.targetHost}:${monitor.targetPort}`;
                      
                      return (
                        <TableRow 
                          key={monitor.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleNavigateToMonitor(monitor.monitorId)}
                        >
                          <TableCell className="font-medium">
                            <div className="max-w-[200px] truncate">
                              {monitor.monitorName || monitor.monitorId}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {monitor.monitorId}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={monitor.success ? "default" : "destructive"}
                                className={monitor.success ? "bg-green-500 hover:bg-green-600" : ""}
                              >
                                <div className={`w-2 h-2 rounded-full mr-1 ${
                                  monitor.success ? 'bg-white' : 'bg-white'
                                }`}></div>
                                {monitor.success ? 'Connected' : 'Failed'}
                              </Badge>
                              {monitor.rawResponseBody && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                        handleShowResponseBody({
                                          name: monitor.monitorName || monitor.monitorId,
                                          body: monitor.rawResponseBody!,
                                          contentType: monitor.responseContentType,
                                          size: monitor.responseSizeBytes,
                                          timestamp: new Date(monitor.executedAt)
                                        });
                                        }}
                                      >
                                        <Eye className="w-3 h-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>View response body</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs max-w-[250px] truncate">
                                {target}
                              </span>

                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              TCP
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              <span className="text-sm">{monitor.agentRegion || 'unknown'}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Timer className="w-3 h-3" />
                              <span className={`font-mono text-sm ${
                                (monitor.responseTime || 0) < 200 ? 'text-green-600' :
                                (monitor.responseTime || 0) < 1000 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {monitor.responseTime || 0}ms
                              </span>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {lastCheck.toLocaleTimeString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {lastCheck.toLocaleDateString()}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNavigateToMonitor(monitor.monitorId);
                                  }}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // TCP connections can't be opened in browser
                                  }}
                                >
                                  <Globe className="w-4 h-4 mr-2" />
                                  Open URL
                                </DropdownMenuItem>
                                {monitor.rawResponseBody && (
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShowResponseBody({
                                        name: monitor.monitorName || monitor.monitorId,
                                        body: monitor.rawResponseBody!,
                                        contentType: monitor.responseContentType,
                                        size: monitor.responseSizeBytes,
                                        timestamp: new Date(monitor.executedAt)
                                      });
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Response
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {filteredMonitors.length === 0 && tcpMonitors.length > 0 && (
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
          {tcpMonitors.length === 0 && (
            <Card className="p-12 text-center">
              <div className="space-y-3">
                <Search className="w-12 h-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">No TCP Monitors Found</h3>
                <p className="text-muted-foreground">
                  No HTTP monitoring data available at the moment
                </p>
              </div>
            </Card>
          )}
      </div>

      {/* Response Body Modal - Simplified for now */}
      {selectedResponseBody && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-4xl max-h-[80vh] m-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Response Body</h3>
                <Button variant="outline" onClick={() => setSelectedResponseBody(null)}>
                  Close
                </Button>
              </div>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono whitespace-pre-wrap">
                {selectedResponseBody.body}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const TCPMonitors: React.FC = () => {
  return (
    <DashboardLayout>
      <TCPMonitorsContent />
    </DashboardLayout>
  );
};

export default TCPMonitors;