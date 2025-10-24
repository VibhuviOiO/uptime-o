import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  Globe, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  MapPin,
  Zap,
  Database,
  Server,
  Wifi,
  WifiOff,
  RefreshCw,
  Filter,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import StatusHistoryTable from "@/components/status/StatusHistoryTable";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

interface DashboardStats {
  totalMonitors: number;
  healthyMonitors: number;
  errorMonitors: number;
  avgResponseTime: number;
  uptime: number;
  incidents24h: number;
  regionsActive: number;
  totalChecks24h: number;
}

interface RegionStat {
  region: string;
  monitors: number;
  healthy: number;
  avgResponseTime: number;
  uptime: number;
}

interface MonitorSummary {
  id: string;
  name: string;
  region: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  uptime: number;
  lastCheck: string;
}

const StatusCard: React.FC<{
  title: string;
  value: string | number;
  trend?: { value: string; direction: 'up' | 'down' | 'stable' };
  icon: React.ReactNode;
  status?: 'good' | 'warning' | 'critical';
}> = ({ title, value, trend, icon, status = 'good' }) => {
  const statusColors = {
    good: "border-green-200 bg-green-50 dark:bg-green-900/10",
    warning: "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10",
    critical: "border-red-200 bg-red-50 dark:bg-red-900/10"
  };

  return (
    <Card className={cn("transition-all duration-200", statusColors[status])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {icon}
              {title}
            </p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <p className={cn(
                "text-sm flex items-center gap-1",
                trend.direction === 'up' ? "text-green-600" : 
                trend.direction === 'down' ? "text-red-600" : "text-muted-foreground"
              )}>
                {trend.direction === 'up' && <TrendingUp className="w-4 h-4" />}
                {trend.direction === 'down' && <TrendingDown className="w-4 h-4" />}
                {trend.value}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RegionHealthCard: React.FC<{ region: RegionStat }> = ({ region }) => {
  const healthPercentage = (region.healthy / region.monitors) * 100;
  const isHealthy = healthPercentage >= 95;
  const isDegraded = healthPercentage >= 80 && healthPercentage < 95;

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{region.region}</span>
            </div>
            <div className="flex items-center gap-1">
              {isHealthy ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : isDegraded ? (
                <Wifi className="w-4 h-4 text-yellow-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Health</span>
              <span className={cn(
                "font-medium",
                isHealthy ? "text-green-600" : isDegraded ? "text-yellow-600" : "text-red-600"
              )}>
                {healthPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  isHealthy ? "bg-green-500" : isDegraded ? "bg-yellow-500" : "bg-red-500"
                )}
                style={{ width: `${healthPercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Monitors: </span>
              <span className="font-medium">{region.monitors}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg RT: </span>
              <span className="font-medium font-mono">{region.avgResponseTime}ms</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MonitorStatusRow: React.FC<{ monitor: MonitorSummary }> = ({ monitor }) => {
  const statusConfig = {
    healthy: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/20" },
    degraded: { icon: AlertCircle, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/20" },
    down: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/20" }
  };

  const config = statusConfig[monitor.status];
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-muted/50",
      config.bg
    )}>
      <div className="flex items-center gap-3">
        <Icon className={cn("w-4 h-4", config.color)} />
        <div>
          <p className="font-medium">{monitor.name}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {monitor.region}
          </p>
        </div>
      </div>
      <div className="text-right space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono">
            {monitor.responseTime}ms
          </Badge>
          <span className="text-xs text-muted-foreground">
            {monitor.uptime}% uptime
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(monitor.lastCheck).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

const ResponseTimeChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Global Response Times
        </CardTitle>
        <CardDescription>
          Average response times across all regions (last 24 hours)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="time" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}ms`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="us-east-1"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="US East 1"
              />
              <Line
                type="monotone"
                dataKey="us-west-2"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="US West 2"
              />
              <Line
                type="monotone"
                dataKey="eu-west-1"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                name="EU West 1"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const UptimeDistribution: React.FC<{ data: any[] }> = ({ data }) => {
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Uptime Distribution
        </CardTitle>
        <CardDescription>
          Monitor health status breakdown
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {data.map((entry, index) => (
            <div key={entry.name} className="text-center">
              <div 
                className="w-4 h-4 rounded mx-auto mb-1"
                style={{ backgroundColor: COLORS[index] }}
              />
              <p className="text-sm font-medium">{entry.name}</p>
              <p className="text-lg font-bold">{entry.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const MonitoringDashboardContent: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [regions, setRegions] = useState<RegionStat[]>([]);
  const [recentMonitors, setRecentMonitors] = useState<MonitorSummary[]>([]);
  const [responseTimeData, setResponseTimeData] = useState<any[]>([]);
  const [uptimeData, setUptimeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    const fetchData = () => {
      // Mock data - replace with real API calls
      setTimeout(() => {
        setStats({
          totalMonitors: 45,
          healthyMonitors: 41,
          errorMonitors: 4,
          avgResponseTime: 247,
          uptime: 99.2,
          incidents24h: 2,
          regionsActive: 3,
          totalChecks24h: 12840
        });

        setRegions([
          {
            region: 'us-east-1',
            monitors: 15,
            healthy: 14,
            avgResponseTime: 235,
            uptime: 99.5
          },
          {
            region: 'us-west-2',
            monitors: 18,
            healthy: 16,
            avgResponseTime: 312,
            uptime: 98.8
          },
          {
            region: 'eu-west-1',
            monitors: 12,
            healthy: 11,
            avgResponseTime: 189,
            uptime: 99.1
          }
        ]);

        setRecentMonitors([
          {
            id: '1',
            name: 'API Gateway Health',
            region: 'us-east-1',
            status: 'healthy',
            responseTime: 156,
            uptime: 99.8,
            lastCheck: new Date().toISOString()
          },
          {
            id: '2',
            name: 'User Authentication',
            region: 'us-west-2',
            status: 'degraded',
            responseTime: 845,
            uptime: 98.2,
            lastCheck: new Date(Date.now() - 30000).toISOString()
          },
          {
            id: '3',
            name: 'Payment Processing',
            region: 'eu-west-1',
            status: 'down',
            responseTime: 0,
            uptime: 95.1,
            lastCheck: new Date(Date.now() - 120000).toISOString()
          }
        ]);

        // Generate mock time series data
        const timeData = [];
        for (let i = 23; i >= 0; i--) {
          const time = new Date(Date.now() - i * 60 * 60 * 1000);
          timeData.push({
            time: time.getHours().toString().padStart(2, '0') + ':00',
            'us-east-1': Math.floor(Math.random() * 100) + 150,
            'us-west-2': Math.floor(Math.random() * 150) + 200,
            'eu-west-1': Math.floor(Math.random() * 80) + 120
          });
        }
        setResponseTimeData(timeData);

        setUptimeData([
          { name: 'Healthy', value: 41 },
          { name: 'Degraded', value: 2 },
          { name: 'Down', value: 2 }
        ]);

        setLoading(false);
      }, 1000);
    };

    fetchData();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  if (loading || !stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const overallHealth = (stats.healthyMonitors / stats.totalMonitors) * 100;
  const healthStatus: 'good' | 'warning' | 'critical' = 
    overallHealth >= 95 ? 'good' : overallHealth >= 85 ? 'warning' : 'critical';

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-500" />
            Monitoring Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time overview of API monitoring across all regions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", autoRefresh && "animate-spin")} />
            Auto Refresh
          </Button>
        </div>
      </div>


      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="System Health"
          value={`${overallHealth.toFixed(1)}%`}
          trend={{ value: "0.3% improvement", direction: "up" }}
          icon={<Activity className="w-4 h-4" />}
          status={healthStatus}
        />
        <StatusCard
          title="Avg Response Time"
          value={`${stats.avgResponseTime}ms`}
          trend={{ value: "15ms faster", direction: "up" }}
          icon={<Zap className="w-4 h-4" />}
        />
        <StatusCard
          title="Active Monitors"
          value={stats.totalMonitors}
          trend={{ value: "2 new monitors", direction: "up" }}
          icon={<Globe className="w-4 h-4" />}
        />
        <StatusCard
          title="24h Incidents"
          value={stats.incidents24h}
          trend={{ value: stats.incidents24h > 0 ? "Needs attention" : "All clear", direction: stats.incidents24h > 0 ? "down" : "stable" }}
          icon={<AlertCircle className="w-4 h-4" />}
          status={stats.incidents24h > 2 ? 'critical' : stats.incidents24h > 0 ? 'warning' : 'good'}
        />
      </div>

      {/* Status History Table (Live Data) */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Service History</h2>
        <p className="text-muted-foreground mb-4">A running log of API service interruptions and status for each datacenter.</p>
        <StatusHistoryTable />
      </div>

      {/* API Service Status Section (from StatusPage) */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-2">API Service Status</h2>
        <p className="text-muted-foreground mb-4">View the operational status of APIs by datacenter and region.</p>
        {/* ...existing API Service Status cards/tables... */}
      </div>

      {/* Regional Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Regional Health Status
          </CardTitle>
          <CardDescription>
            Monitor health breakdown by region
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {regions.map(region => (
              <RegionHealthCard key={region.region} region={region} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ResponseTimeChart data={responseTimeData} />
        <UptimeDistribution data={uptimeData} />
      </div>

      {/* Recent Monitor Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Monitor Status
          </CardTitle>
          <CardDescription>
            Recent status updates from monitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentMonitors.map(monitor => (
              <MonitorStatusRow key={monitor.id} monitor={monitor} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const MonitoringDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <MonitoringDashboardContent />
    </DashboardLayout>
  );
};

export default MonitoringDashboard;