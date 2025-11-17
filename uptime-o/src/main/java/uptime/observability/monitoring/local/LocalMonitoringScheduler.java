package uptime.observability.monitoring.local;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import uptime.observability.domain.HttpMonitor;
import uptime.observability.domain.Instance;
import uptime.observability.repository.HttpMonitorRepository;
import uptime.observability.repository.InstanceRepository;
import uptime.observability.repository.ServiceRepository;
import uptime.observability.domain.enumeration.ServiceType;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
@EnableScheduling
@EnableAsync
@ConditionalOnProperty(name = "application.monitoring.local.enabled", havingValue = "true")
public class LocalMonitoringScheduler {

    private static final Logger LOG = LoggerFactory.getLogger(LocalMonitoringScheduler.class);
    
    private final HttpMonitorRepository httpMonitorRepository;
    private final LocalHttpMonitoringService httpMonitoringService;
    private final InstanceRepository instanceRepository;
    private final LocalInstanceMonitoringService instanceMonitoringService;
    private final ServiceRepository serviceRepository;
    private final LocalServiceMonitoringService serviceMonitoringService;
    private final LocalRedisClusterMonitoringService redisClusterMonitoringService;
    private final LocalKafkaClusterMonitoringService kafkaClusterMonitoringService;
    private final ConcurrentMap<String, Instant> lastExecutionTimes = new ConcurrentHashMap<>();

    public LocalMonitoringScheduler(
        HttpMonitorRepository httpMonitorRepository,
        LocalHttpMonitoringService httpMonitoringService,
        InstanceRepository instanceRepository,
        LocalInstanceMonitoringService instanceMonitoringService,
        ServiceRepository serviceRepository,
        LocalServiceMonitoringService serviceMonitoringService,
        LocalRedisClusterMonitoringService redisClusterMonitoringService,
        LocalKafkaClusterMonitoringService kafkaClusterMonitoringService
    ) {
        this.httpMonitorRepository = httpMonitorRepository;
        this.httpMonitoringService = httpMonitoringService;
        this.instanceRepository = instanceRepository;
        this.instanceMonitoringService = instanceMonitoringService;
        this.serviceRepository = serviceRepository;
        this.serviceMonitoringService = serviceMonitoringService;
        this.redisClusterMonitoringService = redisClusterMonitoringService;
        this.kafkaClusterMonitoringService = kafkaClusterMonitoringService;
    }

    @Scheduled(fixedDelay = 10000) // Check every 10 seconds
    public void scheduleMonitors() {
        scheduleHttpMonitors();
        scheduleInstanceMonitors();
        scheduleServiceMonitors();
    }
    
    private void scheduleHttpMonitors() {
        List<HttpMonitor> enabledMonitors = httpMonitorRepository.findByEnabledTrue();
        
        for (HttpMonitor monitor : enabledMonitors) {
            if (shouldExecuteHttpMonitor(monitor)) {
                executeHttpMonitorAsync(monitor);
                lastExecutionTimes.put("http_" + monitor.getId(), Instant.now());
            }
        }
    }
    
    private void scheduleInstanceMonitors() {
        List<Instance> enabledInstances = instanceRepository.findSelfHostedWithPingEnabled();
        
        for (Instance instance : enabledInstances) {
            if (shouldExecuteInstanceMonitor(instance)) {
                executeInstanceMonitorAsync(instance);
                lastExecutionTimes.put("instance_" + instance.getId(), Instant.now());
            }
        }
    }

    private boolean shouldExecuteHttpMonitor(HttpMonitor monitor) {
        Instant lastExecution = lastExecutionTimes.get("http_" + monitor.getId());
        if (lastExecution == null) {
            return true; // First execution
        }
        
        Instant nextExecution = lastExecution.plusSeconds(monitor.getIntervalSeconds());
        return Instant.now().isAfter(nextExecution);
    }
    
    private boolean shouldExecuteInstanceMonitor(Instance instance) {
        Instant lastExecution = lastExecutionTimes.get("instance_" + instance.getId());
        if (lastExecution == null) {
            return true; // First execution
        }
        
        Instant nextExecution = lastExecution.plusSeconds(instance.getPingInterval());
        return Instant.now().isAfter(nextExecution);
    }

    @Async
    public void executeHttpMonitorAsync(HttpMonitor monitor) {
        try {
            httpMonitoringService.executeMonitor(monitor);
        } catch (Exception e) {
            LOG.error("Error executing HTTP monitor {}: {}", monitor.getName(), e.getMessage());
        }
    }
    
    @Async
    public void executeInstanceMonitorAsync(Instance instance) {
        try {
            instanceMonitoringService.executeInstanceMonitor(instance);
        } catch (Exception e) {
            LOG.error("Error executing instance monitor {}: {}", instance.getName(), e.getMessage());
        }
    }
    
    private void scheduleServiceMonitors() {
        List<uptime.observability.domain.Service> enabledServices = serviceRepository.findByMonitoringEnabledTrueAndIsActiveTrue();
        
        for (uptime.observability.domain.Service service : enabledServices) {
            if (shouldExecuteServiceMonitor(service)) {
                executeServiceMonitorAsync(service);
                lastExecutionTimes.put("service_" + service.getId(), Instant.now());
            }
        }
    }
    
    private boolean shouldExecuteServiceMonitor(uptime.observability.domain.Service service) {
        Instant lastExecution = lastExecutionTimes.get("service_" + service.getId());
        if (lastExecution == null) {
            return true; // First execution
        }
        
        Instant nextExecution = lastExecution.plusSeconds(service.getIntervalSeconds());
        return Instant.now().isAfter(nextExecution);
    }
    
    @Async
    public void executeServiceMonitorAsync(uptime.observability.domain.Service service) {
        try {
            // Always do TCP monitoring
            serviceMonitoringService.executeServiceMonitor(service);
            
            // Additionally do cluster monitoring if enabled
            if (Boolean.TRUE.equals(service.getClusterMonitoringEnabled())) {
                if (ServiceType.REDIS.equals(service.getServiceType())) {
                    redisClusterMonitoringService.executeRedisClusterMonitor(service);
                } else if (ServiceType.KAFKA.equals(service.getServiceType())) {
                    kafkaClusterMonitoringService.executeKafkaClusterMonitor(service);
                }
            }
        } catch (Exception e) {
            LOG.error("Error executing service monitor {}: {}", service.getName(), e.getMessage());
        }
    }
}