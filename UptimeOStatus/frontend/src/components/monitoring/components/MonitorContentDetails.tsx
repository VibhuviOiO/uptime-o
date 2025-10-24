import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

interface MonitorContentDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  records: MonitorHistory[];
  monitor: MonitorDetails | null;
  initialSelectedRecord?: MonitorHistory | null;
}

export const MonitorContentDetails: React.FC<MonitorContentDetailsProps> = ({
  isOpen,
  onClose,
  records,
  monitor,
  initialSelectedRecord
}) => {
  const [selectedRecord, setSelectedRecord] = useState<MonitorHistory | null>(initialSelectedRecord || null);

  // Update selected record when initialSelectedRecord changes
  React.useEffect(() => {
    setSelectedRecord(initialSelectedRecord || null);
  }, [initialSelectedRecord]);

  if (!monitor || records.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Monitoring History Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Monitoring History Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">
                Click on any square to view detailed information below
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                  <span className="text-gray-600">Healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white shadow-sm"></div>
                  <span className="text-gray-600">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm"></div>
                  <span className="text-gray-600">Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
                  <span className="text-gray-600">Failed</span>
                </div>
              </div>
            </div>

            {/* Grid of colored squares */}
            <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
              {records
                .sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime())
                .map((record, index) => {
                  const warningThreshold = monitor?.warningThresholdMs || 500;
                  const criticalThreshold = monitor?.criticalThresholdMs || 1000;
                  const responseTime = record.responseTime || 0;

                  let bgColor: string;

                  if (!record.success) {
                    bgColor = '#ef4444';
                  } else if (responseTime >= criticalThreshold) {
                    bgColor = '#f97316';
                  } else if (responseTime >= warningThreshold) {
                    bgColor = '#f59e0b';
                  } else {
                    bgColor = '#10b981';
                  }

                  const callTime = new Date(record.executedAt);
                  const isSelected = selectedRecord?.id === record.id;

                  return (
                    <div
                      key={record.id || index}
                      className={`w-5 h-5 rounded cursor-pointer hover:scale-125 transition-transform border-2 ${
                        isSelected ? 'border-blue-500 shadow-lg' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: bgColor }}
                      title={`${callTime.toLocaleString()} - ${responseTime}ms`}
                      onClick={() => setSelectedRecord(record)}
                    />
                  );
                })}
            </div>

            {/* Summary stats */}
            <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
              <span>Total checks: {records.length}</span>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                  <span className="font-medium">{records.filter(r => r.success && (r.responseTime || 0) < (monitor?.warningThresholdMs || 500)).length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white shadow-sm"></div>
                  <span className="font-medium">{records.filter(r => r.success && (r.responseTime || 0) >= (monitor?.warningThresholdMs || 500) && (r.responseTime || 0) < (monitor?.criticalThresholdMs || 1000)).length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm"></div>
                  <span className="font-medium">{records.filter(r => r.success && (r.responseTime || 0) >= (monitor?.criticalThresholdMs || 1000)).length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
                  <span className="font-medium">{records.filter(r => !r.success).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Record Details */}
          {selectedRecord && (
            <>
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Call Details</h4>

                {(() => {
                  const record = selectedRecord;
                  const warningThreshold = monitor?.warningThresholdMs || 500;
                  const criticalThreshold = monitor?.criticalThresholdMs || 1000;
                  const responseTime = record.responseTime || 0;

                  let status: string;
                  let statusColor: string;

                  if (!record.success) {
                    status = 'Failed';
                    statusColor = 'text-red-600 bg-red-100';
                  } else if (responseTime >= criticalThreshold) {
                    status = 'Critical';
                    statusColor = 'text-orange-600 bg-orange-100';
                  } else if (responseTime >= warningThreshold) {
                    status = 'Warning';
                    statusColor = 'text-yellow-600 bg-yellow-100';
                  } else {
                    status = 'Healthy';
                    statusColor = 'text-green-600 bg-green-100';
                  }

                  const callTime = new Date(record.executedAt);

                  return (
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-4">
                        {callTime.toLocaleString()}
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            !record.success ? 'bg-red-500' :
                            responseTime >= criticalThreshold ? 'bg-orange-500' :
                            responseTime >= warningThreshold ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-700">
                            {!record.success ? 'Failed' :
                             responseTime >= criticalThreshold ? 'Critical' :
                             responseTime >= warningThreshold ? 'Warning' : 'Healthy'}
                          </span>
                        </div>
                        <span className="text-lg text-gray-700 font-medium">
                          {responseTime}ms response time
                        </span>
                      </div>

                      {/* Basic Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <span className="text-sm text-gray-500 block mb-1">HTTP Status</span>
                          <div className="text-lg font-semibold text-gray-900">
                            {record.responseStatusCode || 'N/A'}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <span className="text-sm text-gray-500 block mb-1">Response Size</span>
                          <div className="text-lg font-semibold text-gray-900">
                            {record.responseSizeBytes ? `${record.responseSizeBytes} bytes` : 'N/A'}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <span className="text-sm text-gray-500 block mb-1">Server</span>
                          <div className="text-lg font-semibold text-gray-900">
                            {record.responseServer || 'N/A'}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <span className="text-sm text-gray-500 block mb-1">Cache Status</span>
                          <div className="text-lg font-semibold text-gray-900">
                            {record.responseCacheStatus || 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Timing Breakdown */}
                      {(record.dnsLookupMs || record.tcpConnectMs || record.tlsHandshakeMs || record.timeToFirstByteMs) && (
                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Timing Breakdown</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {record.dnsLookupMs && (
                              <div className="bg-blue-50 rounded-lg p-4">
                                <span className="text-sm text-blue-600 block mb-1">DNS Lookup</span>
                                <div className="text-xl font-bold text-blue-700">{record.dnsLookupMs}ms</div>
                              </div>
                            )}
                            {record.tcpConnectMs && (
                              <div className="bg-green-50 rounded-lg p-4">
                                <span className="text-sm text-green-600 block mb-1">TCP Connect</span>
                                <div className="text-xl font-bold text-green-700">{record.tcpConnectMs}ms</div>
                              </div>
                            )}
                            {record.tlsHandshakeMs && (
                              <div className="bg-purple-50 rounded-lg p-4">
                                <span className="text-sm text-purple-600 block mb-1">TLS Handshake</span>
                                <div className="text-xl font-bold text-purple-700">{record.tlsHandshakeMs}ms</div>
                              </div>
                            )}
                            {record.timeToFirstByteMs && (
                              <div className="bg-orange-50 rounded-lg p-4">
                                <span className="text-sm text-orange-600 block mb-1">Time to First Byte</span>
                                <div className="text-xl font-bold text-orange-700">{record.timeToFirstByteMs}ms</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Response Headers */}
                      {record.rawResponseHeaders && (
                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Response Headers</h4>
                          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                            <div className="text-sm font-mono space-y-1">
                              {(() => {
                                try {
                                  const headers = typeof record.rawResponseHeaders === 'string'
                                    ? JSON.parse(record.rawResponseHeaders)
                                    : record.rawResponseHeaders;
                                  return Object.entries(headers).map(([key, value]) => (
                                    <div key={key} className="flex">
                                      <span className="text-blue-600 font-medium min-w-0 flex-shrink-0 mr-2">{key}:</span>
                                      <span className="text-gray-800 break-all">{String(value)}</span>
                                    </div>
                                  ));
                                } catch (e) {
                                  return <div className="text-gray-500">Invalid headers format</div>;
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Response Body */}
                      {/* Response Body */}
                      {record.rawResponseBody != null && record.rawResponseBody !== '' && (
                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Response Body</h4>
                          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                            <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                              {(() => {
                                const body = typeof record.rawResponseBody === 'string'
                                  ? record.rawResponseBody
                                  : JSON.stringify(record.rawResponseBody, null, 2);
                                return body;
                              })()}
                            </pre>
                          </div>
                        </div>
                      )}                      {/* Error Message */}
                      {record.errorMessage && (
                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="text-lg font-semibold text-red-600 mb-4">Error Details</h4>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="text-red-700 font-medium">
                              {record.errorMessage}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};