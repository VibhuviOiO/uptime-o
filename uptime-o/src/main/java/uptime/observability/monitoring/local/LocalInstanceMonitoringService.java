package uptime.observability.monitoring.local;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import uptime.observability.domain.Instance;
import uptime.observability.domain.InstanceHeartbeat;
import uptime.observability.domain.HeartbeatType;
import uptime.observability.domain.HeartbeatStatus;
import uptime.observability.repository.InstanceHeartbeatRepository;

import java.io.IOException;
import java.net.InetAddress;
import java.time.Instant;

@Service
@ConditionalOnProperty(name = "application.monitoring.local.enabled", havingValue = "true")
public class LocalInstanceMonitoringService {

    private static final Logger LOG = LoggerFactory.getLogger(LocalInstanceMonitoringService.class);
    
    private final InstanceHeartbeatRepository instanceHeartbeatRepository;

    public LocalInstanceMonitoringService(InstanceHeartbeatRepository instanceHeartbeatRepository) {
        this.instanceHeartbeatRepository = instanceHeartbeatRepository;
    }

    public void executeInstanceMonitor(Instance instance) {
        if (Boolean.TRUE.equals(instance.getPingEnabled())) {
            executePingCheck(instance);
        }
    }

    private void executePingCheck(Instance instance) {
        LOG.debug("Executing ping check for instance: {}", instance.getName());
        
        String targetIp = getTargetIpAddress(instance);
        if (targetIp == null) {
            LOG.warn("No IP address configured for instance: {}", instance.getName());
            return;
        }
        
        Instant startTime = Instant.now();
        InstanceHeartbeat heartbeat = new InstanceHeartbeat();
        heartbeat.setInstanceId(instance.getId());
        heartbeat.setExecutedAt(startTime);
        heartbeat.setHeartbeatType(HeartbeatType.PING);

        try {
            long pingStart = System.nanoTime();
            
            // Use Java's built-in ping to avoid ProcessBuilder debug issues
            InetAddress address = InetAddress.getByName(targetIp);
            boolean reachable = address.isReachable(instance.getPingTimeoutMs());
            
            long pingTime = (System.nanoTime() - pingStart) / 1_000_000; // Convert to ms
            
            heartbeat.setSuccess(reachable);
            heartbeat.setResponseTimeMs((int) Math.min(pingTime, instance.getPingTimeoutMs()));
            heartbeat.setStatus(reachable ? HeartbeatStatus.UP : HeartbeatStatus.DOWN);
            
        } catch (Exception e) {
            LOG.debug("Ping failed for instance {} (IP: {}): {}", instance.getName(), targetIp, e.getMessage());
            heartbeat.setSuccess(false);
            heartbeat.setStatus(HeartbeatStatus.DOWN);
            heartbeat.setErrorMessage(e.getMessage());
            heartbeat.setErrorType("NETWORK_ERROR");
        }

        instanceHeartbeatRepository.save(heartbeat);
    }
    
    private String getTargetIpAddress(Instance instance) {
        // Prefer private IP, fallback to public IP
        if (instance.getPrivateIpAddress() != null && !instance.getPrivateIpAddress().trim().isEmpty()) {
            return instance.getPrivateIpAddress().trim();
        }
        if (instance.getPublicIpAddress() != null && !instance.getPublicIpAddress().trim().isEmpty()) {
            return instance.getPublicIpAddress().trim();
        }
        return null;
    }
}