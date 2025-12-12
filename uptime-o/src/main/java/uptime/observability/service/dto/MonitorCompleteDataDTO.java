package uptime.observability.service.dto;

import java.io.Serializable;
import java.util.List;

/**
 * DTO that combines all monitor data in a single response
 */
public class MonitorCompleteDataDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private MonitorDetailDTO monitor;
    private List<AgentMetricsDTO> agentMetrics;
    private List<TimeSeriesDataDTO> timeSeriesData;

    public MonitorCompleteDataDTO() {}

    public MonitorCompleteDataDTO(MonitorDetailDTO monitor, List<AgentMetricsDTO> agentMetrics, List<TimeSeriesDataDTO> timeSeriesData) {
        this.monitor = monitor;
        this.agentMetrics = agentMetrics;
        this.timeSeriesData = timeSeriesData;
    }

    public MonitorDetailDTO getMonitor() {
        return monitor;
    }

    public void setMonitor(MonitorDetailDTO monitor) {
        this.monitor = monitor;
    }

    public List<AgentMetricsDTO> getAgentMetrics() {
        return agentMetrics;
    }

    public void setAgentMetrics(List<AgentMetricsDTO> agentMetrics) {
        this.agentMetrics = agentMetrics;
    }

    public List<TimeSeriesDataDTO> getTimeSeriesData() {
        return timeSeriesData;
    }

    public void setTimeSeriesData(List<TimeSeriesDataDTO> timeSeriesData) {
        this.timeSeriesData = timeSeriesData;
    }
}