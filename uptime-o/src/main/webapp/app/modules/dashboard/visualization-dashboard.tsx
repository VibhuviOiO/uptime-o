import React, { useEffect, useState, useMemo } from 'react';
import { Row, Col, Card, CardBody, Button, Input, Label } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import GenericChart from '../../shared/charts/GenericChart';
import './visualization-dashboard.scss';

interface Monitor {
  id: number;
  name: string;
}

interface ChartData {
  monitorId: number;
  monitorName: string;
  data: any[];
}

export const VisualizationDashboard = () => {
  const [availableMonitors, setAvailableMonitors] = useState<Monitor[]>([]);
  const [selectedMonitors, setSelectedMonitors] = useState<number[]>([]);
  const [chartsData, setChartsData] = useState<Map<number, any[]>>(new Map());
  const [timeRange, setTimeRange] = useState('1h');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableMonitors();
  }, []);

  useEffect(() => {
    if (selectedMonitors.length > 0) {
      fetchChartsData();
    }
  }, [selectedMonitors, timeRange]);

  const fetchAvailableMonitors = async () => {
    try {
      const response = await axios.get('/api/http-monitors/list');
      setAvailableMonitors(response.data);
    } catch (error) {
      console.error('Error fetching monitors:', error);
    }
  };

  const fetchChartsData = async () => {
    setLoading(true);
    try {
      const params = { monitorIds: selectedMonitors.join(','), timeRange };
      const response = await axios.get('/api/http-monitors/batch', { params });
      const batchData = response.data;

      const newChartsData = new Map<number, any[]>();
      Object.entries(batchData).forEach(([monitorId, data]: [string, any]) => {
        if (data.timeSeriesData) {
          newChartsData.set(Number(monitorId), prepareChartData(data.timeSeriesData));
        }
      });
      setChartsData(newChartsData);
    } catch (error) {
      console.error('Error fetching charts data:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (timeSeriesData: any[]) => {
    const buckets = 50;
    const now = Date.now();
    const timeRangeMs = getTimeRangeMs(timeRange);
    const bucketSize = timeRangeMs / buckets;

    return Array.from({ length: buckets }, (_, i) => {
      const bucketStart = now - timeRangeMs + i * bucketSize;
      const bucketEnd = bucketStart + bucketSize;

      const records = timeSeriesData.filter(r => {
        const t = new Date(r.timestamp).getTime();
        return t >= bucketStart && t < bucketEnd;
      });

      let healthy = 0,
        warning = 0,
        critical = 0,
        failed = 0;
      records.forEach(r => {
        if (!r.success) failed++;
        else if (r.responseTimeMs >= 1000) critical++;
        else if (r.responseTimeMs >= 500) warning++;
        else healthy++;
      });

      return {
        time: new Date(bucketStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        healthy,
        warning,
        critical,
        failed,
      };
    });
  };

  const getTimeRangeMs = (range: string) => {
    const map: Record<string, number> = {
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
    };
    return map[range] || 60 * 60 * 1000;
  };

  const addMonitor = (monitorId: number) => {
    if (selectedMonitors.length < 5 && !selectedMonitors.includes(monitorId)) {
      setSelectedMonitors([...selectedMonitors, monitorId]);
    }
  };

  const removeMonitor = (monitorId: number) => {
    setSelectedMonitors(selectedMonitors.filter(id => id !== monitorId));
    setChartsData(prev => {
      const newMap = new Map(prev);
      newMap.delete(monitorId);
      return newMap;
    });
  };

  return (
    <div className="visualization-dashboard">
      <div className="dashboard-header">
        <h1>Visualization Dashboard</h1>
        <div className="header-actions">
          <div className="time-range-selector">
            {['5m', '15m', '30m', '1h', '4h', '24h'].map(range => (
              <Button
                key={range}
                size="sm"
                color={timeRange === range ? 'primary' : 'secondary'}
                outline={timeRange !== range}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
          <Button color="secondary" outline size="sm" onClick={fetchChartsData} disabled={loading}>
            <FontAwesomeIcon icon={faSync} spin={loading} />
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md="12">
          <Card>
            <CardBody>
              <Label>Select Monitors (Max 5)</Label>
              <div className="monitor-selector">
                <Input type="select" onChange={e => addMonitor(Number(e.target.value))} value="" disabled={selectedMonitors.length >= 5}>
                  <option value="">-- Add Monitor --</option>
                  {availableMonitors
                    .filter(m => !selectedMonitors.includes(m.id))
                    .map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                </Input>
              </div>
              <div className="selected-monitors mt-3">
                {selectedMonitors.map(id => {
                  const monitor = availableMonitors.find(m => m.id === id);
                  return (
                    <span key={id} className="monitor-badge">
                      {monitor?.name}
                      <FontAwesomeIcon icon={faTimes} onClick={() => removeMonitor(id)} />
                    </span>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {selectedMonitors.length === 0 ? (
        <Card>
          <CardBody className="text-center py-5">
            <h5>No monitors selected</h5>
            <p className="text-muted">Select up to 5 monitors to visualize their performance</p>
          </CardBody>
        </Card>
      ) : (
        <Row>
          {selectedMonitors.map(monitorId => {
            const monitor = availableMonitors.find(m => m.id === monitorId);
            const chartData = chartsData.get(monitorId) || [];
            return (
              <Col md="6" key={monitorId} className="mb-4">
                <Card>
                  <CardBody>
                    <h6>{monitor?.name}</h6>
                    {loading ? (
                      <div className="text-center py-5">Loading...</div>
                    ) : (
                      <GenericChart
                        type="bar"
                        data={chartData}
                        xKey="time"
                        yKeys={['healthy', 'warning', 'critical', 'failed']}
                        colors={['#10b981', '#fbbf24', '#f97316', '#ef4444']}
                        height={200}
                      />
                    )}
                  </CardBody>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default VisualizationDashboard;
