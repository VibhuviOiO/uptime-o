package uptime.observability.scheduling.ping;

import java.io.IOException;
import java.net.InetAddress;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptime.observability.domain.HeartbeatStatus;
import uptime.observability.domain.HeartbeatType;
import uptime.observability.domain.Instance;
import uptime.observability.domain.MonitoringType;
import uptime.observability.domain.InstanceHeartbeat;
import uptime.observability.repository.InstanceRepository;
import uptime.observability.repository.InstanceHeartbeatRepository;

@Service
public class PingMonitoringService {

    private static final Logger LOG = LoggerFactory.getLogger(PingMonitoringService.class);

    private final InstanceRepository instanceRepository;
    private final InstanceHeartbeatRepository instanceHeartbeatRepository;

    public PingMonitoringService(InstanceRepository instanceRepository, InstanceHeartbeatRepository instanceHeartbeatRepository) {
        this.instanceRepository = instanceRepository;
        this.instanceHeartbeatRepository = instanceHeartbeatRepository;
    }

    @Scheduled(fixedDelay = 30000, initialDelay = 10000)
    @Transactional
    public void executePingMonitoring() {
        LOG.debug("Starting ping monitoring cycle");

        var instances = instanceRepository.findAll().stream()
            .filter(instance -> instance.getMonitoringType() == MonitoringType.SELF_HOSTED)
            .filter(Instance::getPingEnabled)
            .toList();

        LOG.debug("Found {} SELF_HOSTED instances with ping enabled", instances.size());

        for (Instance instance : instances) {
            try {
                if (shouldExecutePing(instance)) {
                    executePing(instance);
                }
            } catch (Exception e) {
                LOG.error("Error executing ping for instance {}: {}", instance.getId(), e.getMessage(), e);
            }
        }
    }

    private boolean shouldExecutePing(Instance instance) {
        if (instance.getLastPingAt() == null) {
            return true;
        }
        long secondsSinceLastPing = Instant.now().getEpochSecond() - instance.getLastPingAt().getEpochSecond();
        return secondsSinceLastPing >= instance.getPingInterval();
    }

    private void executePing(Instance instance) {
        String target = instance.getPrivateIpAddress() != null ? instance.getPrivateIpAddress() : 
                       instance.getPublicIpAddress() != null ? instance.getPublicIpAddress() : 
                       instance.getHostname();
        
        LOG.debug("Executing ping for instance: {} ({})", instance.getName(), target);

        long startTime = System.currentTimeMillis();
        InstanceHeartbeat heartbeat = new InstanceHeartbeat();
        heartbeat.setInstanceId(instance.getId());
        heartbeat.setExecutedAt(Instant.now());
        heartbeat.setHeartbeatType(HeartbeatType.PING);

        try {
            InetAddress address = InetAddress.getByName(target);
            boolean reachable = address.isReachable(instance.getPingTimeoutMs());
            long responseTime = System.currentTimeMillis() - startTime;

            heartbeat.setSuccess(reachable);
            heartbeat.setResponseTimeMs((int) responseTime);

            if (reachable) {
                heartbeat.setStatus(HeartbeatStatus.UP);
                LOG.debug("Ping successful for {}: {}ms", target, responseTime);
            } else {
                heartbeat.setStatus(HeartbeatStatus.DOWN);
                heartbeat.setErrorMessage("Host unreachable");
                heartbeat.setErrorType("UNREACHABLE");
                LOG.warn("Ping failed for {}: Host unreachable", target);
            }

            instance.setLastPingAt(Instant.now());
            instanceRepository.save(instance);

        } catch (IOException e) {
            long responseTime = System.currentTimeMillis() - startTime;
            heartbeat.setSuccess(false);
            heartbeat.setStatus(HeartbeatStatus.DOWN);
            heartbeat.setResponseTimeMs((int) responseTime);
            heartbeat.setErrorMessage(e.getMessage());
            heartbeat.setErrorType("NETWORK_ERROR");
            LOG.error("Ping error for {}: {}", target, e.getMessage());
        }

        instanceHeartbeatRepository.save(heartbeat);
    }
}
