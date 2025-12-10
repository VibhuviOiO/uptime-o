export interface Indicator {
  type: string;
  enabled: boolean;
  label: string;
  color: string;
  threshold?: number;
}

export interface ViewConfig {
  showLatencyIndicators: boolean;
  indicators: Indicator[];
  indicatorOrder: string[];
  warnThreshold: number;
  dangerThreshold: number;
}

export function getViewConfig(): ViewConfig {
  const showLatencyIndicators = process.env.SHOW_LATENCY_INDICATORS === 'true';
  const warnThreshold = parseInt(process.env.INDICATOR_WARN_THRESHOLD || '500');
  const dangerThreshold = parseInt(process.env.INDICATOR_DANGER_THRESHOLD || '1000');
  
  const indicators: Indicator[] = [
    {
      type: 'SUCCESS',
      enabled: process.env.INDICATOR_SUCCESS_ENABLED !== 'false',
      label: process.env.INDICATOR_SUCCESS_LABEL || 'Available',
      color: process.env.INDICATOR_SUCCESS_COLOR || '#34a853',
    },
    {
      type: 'WARN',
      enabled: process.env.INDICATOR_WARN_ENABLED !== 'false',
      label: process.env.INDICATOR_WARN_LABEL || 'Elevated latency',
      color: process.env.INDICATOR_WARN_COLOR || '#fbbc04',
      threshold: warnThreshold,
    },
    {
      type: 'DANGER',
      enabled: process.env.INDICATOR_DANGER_ENABLED !== 'false',
      label: process.env.INDICATOR_DANGER_LABEL || 'High latency',
      color: process.env.INDICATOR_DANGER_COLOR || '#ff6d00',
      threshold: dangerThreshold,
    },
    {
      type: 'DOWN',
      enabled: process.env.INDICATOR_DOWN_ENABLED !== 'false',
      label: process.env.INDICATOR_DOWN_LABEL || 'Service disruption',
      color: process.env.INDICATOR_DOWN_COLOR || '#ea4335',
    },
  ];

  const indicatorOrder = (process.env.INDICATOR_ORDER || 'SUCCESS,WARN,DANGER,DOWN')
    .split(',')
    .map(s => s.trim());

  return {
    showLatencyIndicators,
    indicators,
    indicatorOrder,
    warnThreshold,
    dangerThreshold,
  };
}
