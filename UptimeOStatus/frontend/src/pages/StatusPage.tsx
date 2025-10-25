import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useStatus } from "@/hooks/useStatus";
import { useRegions, Region } from "@/hooks/useRegions";
import { useDatacenters, Datacenter } from "@/hooks/useDatacenters";
import { useConfig } from "@/hooks/useConfig";
import { Sparkline } from "@/components/status/Sparkline";

const getStatusBadge = (status: string) => {
  const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm";

  // Handle string status values
  switch (status) {
    case "UP":
      return (
        <span className={`${baseClasses} bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 shadow-green-100/50`}>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Healthy
        </span>
      );
    case "DOWN":
      return (
        <span className={`${baseClasses} bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200 shadow-red-100/50`}>
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          DOWN
        </span>
      );
    case "operational":
      return (
        <span className={`${baseClasses} bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 shadow-green-100/50`}>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Operational
        </span>
      );
    case "healthy":
      return (
        <span className={`${baseClasses} bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 shadow-green-100/50`}>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Healthy
        </span>
      );
    case "degraded-orange":
      return (
        <span className={`${baseClasses} bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border-yellow-200 shadow-yellow-100/50`}>
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          Degraded
        </span>
      );
    case "degraded-red":
      return (
        <span className={`${baseClasses} bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 border-orange-200 shadow-orange-100/50`}>
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          Degraded
        </span>
      );
    case "UNKNOWN":
      return (
        <span className={`${baseClasses} bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200 shadow-gray-100/50`}>
          <div className="w-2 h-2 rounded-full bg-gray-500"></div>
          Unknown
        </span>
      );
    case "down":
      return (
        <span className={`${baseClasses} bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200 shadow-red-100/50`}>
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          DOWN
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200 shadow-gray-100/50`}>
          <div className="w-2 h-2 rounded-full bg-gray-500"></div>
          Unknown
        </span>
      );
  }
};

export const StatusPage = () => {
  const [window, setWindow] = useState("1h");
  const [selectedRegion, setSelectedRegion] = useState<number | undefined>();
  const [selectedDatacenter, setSelectedDatacenter] = useState<number | undefined>();

  const { data: statusData, loading: statusLoading, error: statusError } = useStatus(window, selectedRegion, selectedDatacenter);
  const { data: regions, loading: regionsLoading } = useRegions();
  const { data: datacenters, loading: datacentersLoading } = useDatacenters();
  const { data: config, loading: configLoading } = useConfig();

  if (statusLoading || configLoading) return <div>Loading...</div>;
  if (statusError) return <div>Error: {statusError}</div>;
  if (!config) return <div>Loading configuration...</div>;

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <div className="flex flex-col items-center text-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">{config.statusPageTitle}</h1>
              <p className="text-slate-600 mt-1">{config.statusPageSubtitle}</p>
            </div>
          </div>

          <hr className="border-slate-200 mb-8" />

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-slate-700">Time Window</span>
              </div>
              <select
                value={window}
                onChange={(e) => setWindow(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:border-slate-400 transition-colors"
              >
                <option value="5m">Last 5 minutes</option>
                <option value="15m">Last 15 minutes</option>
                <option value="30m">Last 30 minutes</option>
                <option value="1h">Last hour</option>
                <option value="4h">Last 4 hours</option>
                <option value="24h">Last 24 hours</option>
              </select>

              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
                <span className="text-sm font-medium text-slate-700">Region</span>
              </div>
              <select
                value={selectedRegion || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedRegion(value ? parseInt(value) : undefined);
                  setSelectedDatacenter(undefined); // Reset datacenter when region changes
                }}
                className="bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:border-slate-400 transition-colors"
              >
                <option value="">All Regions</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-sm font-medium text-slate-700">Datacenter</span>
              </div>
              <select
                value={selectedDatacenter || ""}
                onChange={(e) => setSelectedDatacenter(e.target.value ? parseInt(e.target.value) : undefined)}
                className="bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:border-slate-400 transition-colors"
              >
                <option value="">All Datacenters</option>
                {datacenters
                  .filter((dc) => !selectedRegion || dc.regionId === selectedRegion)
                  .map((datacenter) => (
                    <option key={datacenter.id} value={datacenter.id}>
                      {datacenter.name} ({datacenter.code})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

            <div className="grid grid-cols-1 gap-5">
        {statusData.map((row) => (
          <Card key={`${row.monitorId}-${row.datacenter_id}`} className="group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border-0 bg-gradient-to-br from-white to-white shadow-lg shadow-slate-100/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm"></div>
                    <h3 className="font-bold text-xl text-slate-900 leading-tight truncate group-hover:text-slate-800 transition-colors">{row.monitorName}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{row.region} • {row.datacenter}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-6">
                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{row.successRate}%</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">uptime</div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(row.status)}
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(row.success)}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="font-medium">Response Status</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Last {window}</span>
                  </div>
                </div>
                <Sparkline monitorId={row.monitorId} datacenterId={row.datacenter_id} window={window} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StatusPage;
