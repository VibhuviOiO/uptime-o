package uptime.observability.service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptime.observability.domain.*;
import uptime.observability.repository.*;
import uptime.observability.service.dto.*;

@Service
@Transactional(readOnly = true)
public class MonitorDetailService {
    
    private static final Logger LOG = LoggerFactory.getLogger(MonitorDetailService.class);

    @Autowired
    private HttpMonitorRepository httpMonitorRepository;

    @Autowired
    private HttpHeartbeatRepository httpHeartbeatRepository;

    public MonitorDetailDTO getMonitorDetail(Long monitorId) {
        LOG.debug("Fetching monitor detail for ID: {}", monitorId);

        HttpMonitor monitor = httpMonitorRepository.findById(monitorId)
            .orElseThrow(() -> new RuntimeException("Monitor not found with id: " + monitorId));

        List<HttpHeartbeat> heartbeats = httpHeartbeatRepository.findByMonitorIdOrderByExecutedAtDesc(monitorId);

        Long totalChecks = (long) heartbeats.size();
        Long successfulChecks = heartbeats.stream().filter(h -> Boolean.TRUE.equals(h.getSuccess())).count();
        Long failedChecks = totalChecks - successfulChecks;
        
        Double averageResponseTime = heartbeats.stream()
            .filter(h -> h.getResponseTimeMs() != null)
            .mapToInt(HttpHeartbeat::getResponseTimeMs)
            .average()
            .orElse(0.0);

        Double uptimePercentage = totalChecks > 0 ? (successfulChecks * 100.0) / totalChecks : 0.0;

        Instant lastCheckedAt = heartbeats.isEmpty() ? null : heartbeats.get(0).getExecutedAt();
        Boolean lastSuccess = heartbeats.isEmpty() ? null : heartbeats.get(0).getSuccess();

        List<String> regions = heartbeats.stream()
            .map(h -> h.getAgent())
            .filter(Objects::nonNull)
            .map(Agent::getRegion)
            .filter(Objects::nonNull)
            .map(Region::getName)
            .distinct()
            .sorted()
            .collect(Collectors.toList());

        List<String> agents = heartbeats.stream()
            .map(h -> h.getAgent())
            .filter(Objects::nonNull)
            .map(Agent::getName)
            .distinct()
            .sorted()
            .collect(Collectors.toList());

        MonitorDetailDTO dto = new MonitorDetailDTO(
            monitor.getId(),
            monitor.getName(),
            monitor.getUrl(),
            monitor.getMethod(),
            monitor.getType(),
            monitor.getIntervalSeconds(),
            true,
            monitor.getResponseTimeWarningMs(),
            monitor.getResponseTimeCriticalMs(),
            null,
            null,
            totalChecks,
            successfulChecks,
            failedChecks,
            averageResponseTime,
            uptimePercentage,
            lastCheckedAt,
            lastSuccess
        );
        
        dto.setRegions(regions);
        dto.setAgents(agents);

        return dto;
    }

    public List<AgentMetricsDTO> getAgentMetrics(Long monitorId, Instant startTime, Instant endTime, String agentRegion) {
        LOG.debug("Fetching agent metrics for monitor: {}, startTime: {}, endTime: {}, region: {}", 
            monitorId, startTime, endTime, agentRegion);

        List<HttpHeartbeat> heartbeats = httpHeartbeatRepository
            .findByMonitorIdAndExecutedAtBetweenOrderByExecutedAtDesc(
                monitorId, 
                startTime != null ? startTime : Instant.EPOCH, 
                endTime != null ? endTime : Instant.now()
            );

        if (agentRegion != null && !agentRegion.isEmpty() && !agentRegion.equalsIgnoreCase("all")) {
            heartbeats = heartbeats.stream()
                .filter(h -> h.getAgent() != null && 
                           h.getAgent().getRegion() != null && 
                           agentRegion.equals(h.getAgent().getRegion().getName()))
                .collect(Collectors.toList());
        }

        Map<String, List<HttpHeartbeat>> heartbeatsByAgent = heartbeats.stream()
            .filter(h -> h.getAgent() != null)
            .collect(Collectors.groupingBy(h -> h.getAgent().getName()));

        List<AgentMetricsDTO> agentMetrics = new ArrayList<>();
        
        for (Map.Entry<String, List<HttpHeartbeat>> entry : heartbeatsByAgent.entrySet()) {
            List<HttpHeartbeat> agentHeartbeats = entry.getValue();
            if (agentHeartbeats.isEmpty()) continue;

            Agent agent = agentHeartbeats.get(0).getAgent();
            Region region = agent.getRegion();

            HttpMonitor monitor = httpMonitorRepository.findById(monitorId).orElse(null);
            Integer warningThreshold = monitor != null ? monitor.getResponseTimeWarningMs() : null;
            Integer criticalThreshold = monitor != null ? monitor.getResponseTimeCriticalMs() : null;

            Long totalChecks = (long) agentHeartbeats.size();
            Long successfulChecks = agentHeartbeats.stream().filter(h -> Boolean.TRUE.equals(h.getSuccess())).count();
            Long failedChecks = totalChecks - successfulChecks;

            Long warningChecks = warningThreshold != null ? agentHeartbeats.stream()
                .filter(h -> h.getResponseTimeMs() != null && h.getResponseTimeMs() >= warningThreshold && 
                           (criticalThreshold == null || h.getResponseTimeMs() < criticalThreshold))
                .count() : 0L;

            Long criticalChecks = criticalThreshold != null ? agentHeartbeats.stream()
                .filter(h -> h.getResponseTimeMs() != null && h.getResponseTimeMs() >= criticalThreshold)
                .count() : 0L;

            Double averageResponseTime = agentHeartbeats.stream()
                .filter(h -> h.getResponseTimeMs() != null)
                .mapToInt(HttpHeartbeat::getResponseTimeMs)
                .average()
                .orElse(0.0);

            Double uptimePercentage = totalChecks > 0 ? (successfulChecks * 100.0) / totalChecks : 0.0;

            List<Integer> responseTimes = agentHeartbeats.stream()
                .filter(h -> h.getResponseTimeMs() != null)
                .map(HttpHeartbeat::getResponseTimeMs)
                .sorted()
                .collect(Collectors.toList());

            Integer p95 = calculatePercentile(responseTimes, 95);
            Integer p99 = calculatePercentile(responseTimes, 99);

            Instant lastCheckedAt = agentHeartbeats.get(0).getExecutedAt();
            Boolean lastSuccess = agentHeartbeats.get(0).getSuccess();
            Integer lastResponseTime = agentHeartbeats.get(0).getResponseTimeMs();

            AgentMetricsDTO dto = new AgentMetricsDTO(
                agent.getName(),
                region != null ? region.getName() : null,
                region != null ? region.getName() : null,
                totalChecks,
                successfulChecks,
                failedChecks,
                warningChecks,
                criticalChecks,
                averageResponseTime,
                uptimePercentage,
                p95,
                p99,
                lastCheckedAt,
                lastSuccess,
                lastResponseTime
            );

            agentMetrics.add(dto);
        }

        agentMetrics.sort(Comparator
            .comparing(AgentMetricsDTO::getAgentRegion, Comparator.nullsLast(Comparator.naturalOrder()))
            .thenComparing(AgentMetricsDTO::getAgentName));

        return agentMetrics;
    }

    public List<TimeSeriesDataDTO> getTimeSeriesData(Long monitorId, Instant startTime, Instant endTime, String agentRegion) {
        LOG.debug("Fetching time-series data for monitor: {}, startTime: {}, endTime: {}, region: {}", 
            monitorId, startTime, endTime, agentRegion);

        List<HttpHeartbeat> heartbeats = httpHeartbeatRepository
            .findByMonitorIdAndExecutedAtBetweenOrderByExecutedAtDesc(
                monitorId, 
                startTime != null ? startTime : Instant.EPOCH, 
                endTime != null ? endTime : Instant.now()
            );

        if (agentRegion != null && !agentRegion.isEmpty() && !agentRegion.equalsIgnoreCase("all")) {
            heartbeats = heartbeats.stream()
                .filter(h -> h.getAgent() != null && 
                           h.getAgent().getRegion() != null && 
                           agentRegion.equals(h.getAgent().getRegion().getName()))
                .collect(Collectors.toList());
        }

        return heartbeats.stream()
            .map(h -> {
                Agent agent = h.getAgent();
                Region region = agent != null ? agent.getRegion() : null;

                return new TimeSeriesDataDTO(
                    h.getExecutedAt(),
                    agent != null ? agent.getName() : null,
                    region != null ? region.getName() : null,
                    h.getSuccess(),
                    h.getResponseTimeMs(),
                    h.getResponseStatusCode(),
                    h.getErrorType(),
                    h.getErrorMessage(),
                    h.getResponseSizeBytes(),
                    h.getResponseServer(),
                    h.getResponseCacheStatus(),
                    h.getDnsLookupMs(),
                    h.getTcpConnectMs(),
                    h.getTlsHandshakeMs(),
                    h.getTimeToFirstByteMs(),
                    h.getRawResponseHeaders(),
                    h.getRawResponseBody()
                );
            })
            .collect(Collectors.toList());
    }

    private Integer calculatePercentile(List<Integer> sortedValues, int percentile) {
        if (sortedValues == null || sortedValues.isEmpty()) {
            return null;
        }
        
        int index = (int) Math.ceil((percentile / 100.0) * sortedValues.size()) - 1;
        index = Math.max(0, Math.min(index, sortedValues.size() - 1));
        return sortedValues.get(index);
    }
}
