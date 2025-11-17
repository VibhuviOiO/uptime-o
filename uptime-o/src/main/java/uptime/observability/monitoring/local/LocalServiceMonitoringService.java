package uptime.observability.monitoring.local;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import uptime.observability.domain.ServiceHeartbeat;
import uptime.observability.domain.ServiceInstance;
import uptime.observability.domain.enumeration.ServiceStatus;
import uptime.observability.repository.ServiceHeartbeatRepository;
import uptime.observability.repository.ServiceInstanceRepository;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.time.Instant;
import java.util.List;

@Service
@ConditionalOnProperty(name = "application.monitoring.local.enabled", havingValue = "true")
public class LocalServiceMonitoringService {

    private static final Logger LOG = LoggerFactory.getLogger(LocalServiceMonitoringService.class);
    
    private final ServiceHeartbeatRepository serviceHeartbeatRepository;
    private final ServiceInstanceRepository serviceInstanceRepository;

    public LocalServiceMonitoringService(ServiceHeartbeatRepository serviceHeartbeatRepository, ServiceInstanceRepository serviceInstanceRepository) {
        this.serviceHeartbeatRepository = serviceHeartbeatRepository;
        this.serviceInstanceRepository = serviceInstanceRepository;
    }

    public void executeServiceMonitor(uptime.observability.domain.Service service) {
        if (!Boolean.TRUE.equals(service.getMonitoringEnabled())) {
            return;
        }

        LOG.debug("Executing TCP monitoring for service: {}", service.getName());
        
        // Get all active instances for this service
        List<ServiceInstance> instances = serviceInstanceRepository.findByServiceIdAndIsActiveTrue(service.getId());
        
        for (ServiceInstance serviceInstance : instances) {
            executeTcpCheck(service, serviceInstance);
        }
    }

    private void executeTcpCheck(uptime.observability.domain.Service service, ServiceInstance serviceInstance) {
        LOG.debug("Executing TCP check for service: {} on instance: {} port: {}", 
                  service.getName(), serviceInstance.getInstanceName(), serviceInstance.getPort());
        
        String targetIp = getTargetIpAddress(serviceInstance);
        if (targetIp == null) {
            LOG.warn("No IP address available for service instance: {}", serviceInstance.getInstanceName());
            return;
        }
        
        Instant startTime = Instant.now();
        ServiceHeartbeat heartbeat = new ServiceHeartbeat();
        heartbeat.setService(service);
        heartbeat.setServiceInstance(serviceInstance);
        heartbeat.setExecutedAt(startTime);

        try {
            long tcpStart = System.nanoTime();
            
            // TCP connection test
            try (Socket socket = new Socket()) {
                socket.connect(new InetSocketAddress(targetIp, serviceInstance.getPort()), service.getTimeoutMs());
                long tcpTime = (System.nanoTime() - tcpStart) / 1_000_000; // Convert to ms
                
                heartbeat.setSuccess(true);
                heartbeat.setResponseTimeMs((int) tcpTime);
                
                // Set status based on latency thresholds
                if (tcpTime <= service.getLatencyWarningMs()) {
                    heartbeat.setStatus(ServiceStatus.UP);
                } else if (tcpTime <= service.getLatencyCriticalMs()) {
                    heartbeat.setStatus(ServiceStatus.WARNING);
                } else {
                    heartbeat.setStatus(ServiceStatus.CRITICAL);
                }
            }
            
        } catch (IOException e) {
            LOG.debug("TCP connection failed for service {} ({}:{}): {}", 
                      service.getName(), targetIp, serviceInstance.getPort(), e.getMessage());
            heartbeat.setSuccess(false);
            heartbeat.setStatus(ServiceStatus.DOWN);
            heartbeat.setErrorMessage(e.getMessage());
        }

        serviceHeartbeatRepository.save(heartbeat);
    }
    
    private String getTargetIpAddress(ServiceInstance serviceInstance) {
        // Prefer private IP, fallback to public IP
        if (serviceInstance.getInstancePrivateIpAddress() != null && !serviceInstance.getInstancePrivateIpAddress().trim().isEmpty()) {
            return serviceInstance.getInstancePrivateIpAddress().trim();
        }
        if (serviceInstance.getInstancePublicIpAddress() != null && !serviceInstance.getInstancePublicIpAddress().trim().isEmpty()) {
            return serviceInstance.getInstancePublicIpAddress().trim();
        }
        return null;
    }
}