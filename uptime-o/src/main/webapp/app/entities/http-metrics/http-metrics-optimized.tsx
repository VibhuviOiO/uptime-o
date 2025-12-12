import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HttpMetricsService } from './http-metrics.service';
import { HttpMetricsDTO } from './http-metrics.model';

interface PaginationParams {
  page: number;
  size: number;
  timeRange: string; // '1h', '6h', '24h', '7d'
}

interface TimeRangeFilter {
  startTime: string;
  endTime: string;
}

export const HttpMetricsOptimized = () => {
  const [metrics, setMetrics] = useState<HttpMetricsDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 0,
    size: 50, // Limit initial load
    timeRange: '1h',
  });
  const [totalElements, setTotalElements] = useState(0);

  // Debounced search to prevent excessive API calls
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Server-side filtering with time range limits
  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const timeFilter = getTimeRangeFilter(pagination.timeRange);
      const params = {
        page: pagination.page,
        size: pagination.size,
        search: debouncedSearch,
        startTime: timeFilter.startTime,
        endTime: timeFilter.endTime,
      };

      const response = await HttpMetricsService.getAggregatedMetricsPaginated(params);
      setMetrics(response.content);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination, debouncedSearch]);

  // Time range helper
  const getTimeRangeFilter = (range: string): TimeRangeFilter => {
    const now = new Date();
    const startTime = new Date();

    switch (range) {
      case '1h':
        startTime.setHours(now.getHours() - 1);
        break;
      case '6h':
        startTime.setHours(now.getHours() - 6);
        break;
      case '24h':
        startTime.setDate(now.getDate() - 1);
        break;
      case '7d':
        startTime.setDate(now.getDate() - 7);
        break;
      default:
        startTime.setHours(now.getHours() - 1);
    }

    return {
      startTime: startTime.toISOString(),
      endTime: now.toISOString(),
    };
  };

  // Virtual scrolling for large datasets
  const handleLoadMore = useCallback(() => {
    if (!loading && metrics.length < totalElements) {
      setPagination(prev => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  }, [loading, metrics.length, totalElements]);

  // Time range selector
  const handleTimeRangeChange = (range: string) => {
    setPagination(prev => ({
      ...prev,
      timeRange: range,
      page: 0, // Reset pagination
    }));
    setMetrics([]); // Clear existing data
  };

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return (
    <div className="http-metrics-optimized">
      {/* Time Range Selector */}
      <div className="time-range-controls">
        {['1h', '6h', '24h', '7d'].map(range => (
          <button
            key={range}
            className={`time-btn ${pagination.timeRange === range ? 'active' : ''}`}
            onClick={() => handleTimeRangeChange(range)}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Search with debouncing */}
      <input
        type="text"
        placeholder="Search monitors..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="search-input"
      />

      {/* Metrics List with Virtual Scrolling */}
      <div className="metrics-list" onScroll={handleLoadMore}>
        {metrics.map((metric, index) => (
          <div key={`${metric.monitorId}-${index}`} className="metric-item">
            {/* Metric content */}
          </div>
        ))}
        {loading && <div className="loading-indicator">Loading...</div>}
      </div>
    </div>
  );
};
