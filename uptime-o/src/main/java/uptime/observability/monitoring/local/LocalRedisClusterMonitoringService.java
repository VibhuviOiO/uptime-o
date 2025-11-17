package uptime.observability.monitoring.local;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import uptime.observability.domain.ServiceHeartbeat;
import uptime.observability.domain.ServiceInstance;
import uptime.observability.domain.enumeration.ServiceStatus;
import uptime.observability.repository.ServiceHeartbeatRepository;
import uptime.observability.repository.ServiceInstanceRepository;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.Socket;
import java.time.Instant;
import java.util.List;

@Service
@ConditionalOnProperty(name = "application.monitoring.local.enabled", havingValue = "true")
public class LocalRedisClusterMonitoringService {

    private static final Logger LOG = LoggerFactory.getLogger(LocalRedisClusterMonitoringService.class);
    
    private final ServiceHeartbeatRepository serviceHeartbeatRepository;
    private final ServiceInstanceRepository serviceInstanceRepository;
    private final ObjectMapper objectMapper;

    public LocalRedisClusterMonitoringService(
        ServiceHeartbeatRepository serviceHeartbeatRepository, 
        ServiceInstanceRepository serviceInstanceRepository,
        ObjectMapper objectMapper
    ) {
        this.serviceHeartbeatRepository = serviceHeartbeatRepository;
        this.serviceInstanceRepository = serviceInstanceRepository;
        this.objectMapper = objectMapper;
    }

    public void executeRedisClusterMonitor(uptime.observability.domain.Service service) {
        if (!Boolean.TRUE.equals(service.getClusterMonitoringEnabled())) {
            return;
        }

        LOG.debug("Executing Redis cluster monitoring for service: {}", service.getName());
        
        // Get all active instances for this service
        List<ServiceInstance> instances = serviceInstanceRepository.findByServiceIdAndIsActiveTrue(service.getId());
        
        if (instances.isEmpty()) {
            LOG.warn("No active instances found for Redis cluster service: {}", service.getName());
            return;
        }

        // Try to connect to any available node to get cluster info
        ServiceInstance connectedInstance = null;
        String clusterInfo = null;
        
        for (ServiceInstance instance : instances) {
            try {
                clusterInfo = getRedisClusterInfo(instance);
                if (clusterInfo != null) {
                    connectedInstance = instance;
                    break;
                }
            } catch (Exception e) {
                LOG.debug("Failed to connect to Redis node {}:{}: {}", 
                         instance.getInstancePrivateIpAddress(), instance.getPort(), e.getMessage());
            }
        }
        
        // Create cluster-level heartbeat
        createClusterHeartbeat(service, connectedInstance, clusterInfo);
    }

    private String getRedisClusterInfo(ServiceInstance instance) throws IOException {
        String targetIp = getTargetIpAddress(instance);
        if (targetIp == null) {
            return null;
        }

        try (Socket socket = new Socket(targetIp, instance.getPort())) {
            socket.setSoTimeout(5000);
            
            ObjectNode allInfo = objectMapper.createObjectNode();
            
            // Collect cluster info
            ObjectNode clusterInfo = sendRedisCommand(socket, "CLUSTER", "INFO");
            if (clusterInfo != null) allInfo.set("cluster", clusterInfo);
            
            // Collect performance stats
            ObjectNode stats = sendRedisInfoCommand(socket, "stats");
            if (stats != null) allInfo.set("stats", stats);
            
            // Collect memory info
            ObjectNode memory = sendRedisInfoCommand(socket, "memory");
            if (memory != null) allInfo.set("memory", memory);
            
            // Collect server info
            ObjectNode server = sendRedisInfoCommand(socket, "server");
            if (server != null) allInfo.set("server", server);
            
            // Collect keyspace info
            ObjectNode keyspace = sendRedisInfoCommand(socket, "keyspace");
            if (keyspace != null) allInfo.set("keyspace", keyspace);
            
            // Get total keys count
            Long dbSize = sendRedisDbSizeCommand(socket);
            if (dbSize != null) allInfo.put("total_keys", dbSize);
            
            return allInfo.toString();
        }
    }
    
    private ObjectNode sendRedisCommand(Socket socket, String... args) throws IOException {
        // Build Redis protocol command
        StringBuilder cmd = new StringBuilder();
        cmd.append("*").append(args.length).append("\r\n");
        for (String arg : args) {
            cmd.append("$").append(arg.length()).append("\r\n").append(arg).append("\r\n");
        }
        
        socket.getOutputStream().write(cmd.toString().getBytes());
        socket.getOutputStream().flush();
        
        BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
        ObjectNode result = objectMapper.createObjectNode();
        
        // Skip protocol response line
        reader.readLine();
        
        String line;
        while ((line = reader.readLine()) != null && !line.isEmpty()) {
            if (line.contains(":")) {
                String[] parts = line.split(":", 2);
                String key = parts[0].trim();
                String value = parts[1].trim();
                
                try {
                    if (value.matches("\\d+")) {
                        result.put(key, Long.parseLong(value));
                    } else if (value.matches("\\d+\\.\\d+")) {
                        result.put(key, Double.parseDouble(value));
                    } else {
                        result.put(key, value);
                    }
                } catch (NumberFormatException e) {
                    result.put(key, value);
                }
            }
        }
        
        return result.size() > 0 ? result : null;
    }
    
    private ObjectNode sendRedisInfoCommand(Socket socket, String section) throws IOException {
        return sendRedisCommand(socket, "INFO", section);
    }
    
    private Long sendRedisDbSizeCommand(Socket socket) throws IOException {
        try {
            socket.getOutputStream().write("*1\r\n$6\r\nDBSIZE\r\n".getBytes());
            socket.getOutputStream().flush();
            
            BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            String response = reader.readLine();
            
            if (response != null && response.startsWith(":")) {
                return Long.parseLong(response.substring(1));
            }
        } catch (Exception e) {
            LOG.debug("Failed to get DBSIZE: {}", e.getMessage());
        }
        return null;
    }

    private void createClusterHeartbeat(uptime.observability.domain.Service service, ServiceInstance connectedInstance, String clusterInfo) {
        Instant startTime = Instant.now();
        ServiceHeartbeat heartbeat = new ServiceHeartbeat();
        heartbeat.setService(service);
        heartbeat.setServiceInstance(null); // Cluster-level heartbeat
        heartbeat.setExecutedAt(startTime);

        if (clusterInfo != null && connectedInstance != null) {
            try {
                // Parse comprehensive Redis info
                JsonNode allInfo = objectMapper.readTree(clusterInfo);
                ObjectNode metadata = objectMapper.createObjectNode();
                
                // Add cluster info
                if (allInfo.has("cluster")) {
                    metadata.set("cluster", allInfo.get("cluster"));
                }
                
                // Add performance stats
                if (allInfo.has("stats")) {
                    metadata.set("stats", allInfo.get("stats"));
                }
                
                // Add memory info
                if (allInfo.has("memory")) {
                    metadata.set("memory", allInfo.get("memory"));
                }
                
                // Add server info
                if (allInfo.has("server")) {
                    metadata.set("server", allInfo.get("server"));
                }
                
                // Add keyspace info
                if (allInfo.has("keyspace")) {
                    metadata.set("keyspace", allInfo.get("keyspace"));
                }
                
                // Add total keys
                if (allInfo.has("total_keys")) {
                    metadata.put("total_keys", allInfo.get("total_keys").asLong());
                }
                
                metadata.put("connected_node", connectedInstance.getInstanceName() + ":" + connectedInstance.getPort());
                
                heartbeat.setSuccess(true);
                heartbeat.setStatus(determineClusterStatus(allInfo));
                heartbeat.setMetadata(metadata);
                heartbeat.setResponseTimeMs(1);
            } catch (Exception e) {
                LOG.warn("Failed to parse Redis cluster info: {}", e.getMessage());
                heartbeat.setSuccess(false);
                heartbeat.setStatus(ServiceStatus.CRITICAL);
                heartbeat.setErrorMessage("Failed to parse cluster info: " + e.getMessage());
            }
        } else {
            heartbeat.setSuccess(false);
            heartbeat.setStatus(ServiceStatus.DOWN);
            heartbeat.setErrorMessage("Unable to connect to any Redis cluster node");
        }

        serviceHeartbeatRepository.save(heartbeat);
    }



    private ServiceStatus determineClusterStatus(JsonNode allInfo) {
        JsonNode cluster = allInfo.path("cluster");
        JsonNode memory = allInfo.path("memory");
        JsonNode server = allInfo.path("server");
        
        String clusterState = cluster.path("cluster_state").asText();
        long clusterSlotsAssigned = cluster.path("cluster_slots_assigned").asLong();
        long clusterSlotsFail = cluster.path("cluster_slots_fail").asLong();
        
        // Check memory fragmentation
        double memFragmentation = memory.path("mem_fragmentation_ratio").asDouble(1.0);
        
        // Check connected clients
        long connectedClients = server.path("connected_clients").asLong();
        long blockedClients = server.path("blocked_clients").asLong();
        
        // Critical conditions
        if (!"ok".equals(clusterState) || clusterSlotsFail > 0) {
            return ServiceStatus.CRITICAL;
        }
        
        // Warning conditions
        if (clusterSlotsAssigned < 16384 || memFragmentation > 2.0 || blockedClients > 10) {
            return ServiceStatus.WARNING;
        }
        
        // All good
        if (clusterSlotsAssigned == 16384) {
            return ServiceStatus.UP;
        }
        
        return ServiceStatus.DEGRADED;
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