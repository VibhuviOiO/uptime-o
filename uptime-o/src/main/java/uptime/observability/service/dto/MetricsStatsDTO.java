package uptime.observability.service.dto;

public class MetricsStatsDTO {
    private int upCount;
    private int downCount;
    private double avgLatency;
    private int totalCount;

    public MetricsStatsDTO() {}

    public MetricsStatsDTO(int upCount, int downCount, double avgLatency, int totalCount) {
        this.upCount = upCount;
        this.downCount = downCount;
        this.avgLatency = avgLatency;
        this.totalCount = totalCount;
    }

    public int getUpCount() { return upCount; }
    public void setUpCount(int upCount) { this.upCount = upCount; }

    public int getDownCount() { return downCount; }
    public void setDownCount(int downCount) { this.downCount = downCount; }

    public double getAvgLatency() { return avgLatency; }
    public void setAvgLatency(double avgLatency) { this.avgLatency = avgLatency; }

    public int getTotalCount() { return totalCount; }
    public void setTotalCount(int totalCount) { this.totalCount = totalCount; }
}