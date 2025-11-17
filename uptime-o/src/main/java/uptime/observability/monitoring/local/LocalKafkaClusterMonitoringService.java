package uptime.observability.monitoring.local;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
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
import java.util.Properties;

@Service
@ConditionalOnProperty(name = "application.monitoring.local.enabled", havingValue = "true")
public class LocalKafkaClusterMonitoringService {

    private static final Logger LOG = LoggerFactory.getLogger(LocalKafkaClusterMonitoringService.class);
    
    private final ServiceHeartbeatRepository serviceHeartbeatRepository;
    private final ServiceInstanceRepository serviceInstanceRepository;
    private final ObjectMapper objectMapper;

    public LocalKafkaClusterMonitoringService(
        ServiceHeartbeatRepository serviceHeartbeatRepository, 
        ServiceInstanceRepository serviceInstanceRepository,
        ObjectMapper objectMapper
    ) {
        this.serviceHeartbeatRepository = serviceHeartbeatRepository;
        this.serviceInstanceRepository = serviceInstanceRepository;
        this.objectMapper = objectMapper;
    }

    public void executeKafkaClusterMonitor(uptime.observability.domain.Service service) {
        if (!Boolean.TRUE.equals(service.getClusterMonitoringEnabled())) {
            return;
        }

        LOG.debug("Executing Kafka cluster monitoring for service: {}", service.getName());
        
        List<ServiceInstance> instances = serviceInstanceRepository.findByServiceIdAndIsActiveTrue(service.getId());
        
        if (instances.isEmpty()) {
            LOG.warn("No active instances found for Kafka cluster service: {}", service.getName());
            return;
        }

        ServiceInstance connectedInstance = null;
        String clusterInfo = null;
        
        for (ServiceInstance instance : instances) {
            try {
                clusterInfo = getKafkaClusterInfo(instance);
                if (clusterInfo != null) {
                    connectedInstance = instance;
                    break;
                }
            } catch (Exception e) {
                LOG.debug("Failed to connect to Kafka broker {}:{}: {}", 
                         instance.getInstancePrivateIpAddress(), instance.getPort(), e.getMessage());
            }
        }
        
        createClusterHeartbeat(service, connectedInstance, clusterInfo);
    }

    private String getKafkaClusterInfo(ServiceInstance instance) throws IOException {
        String targetIp = getTargetIpAddress(instance);
        if (targetIp == null) {
            return null;
        }

        try (Socket socket = new Socket(targetIp, instance.getPort())) {
            socket.setSoTimeout(5000);
            
            ObjectNode allInfo = objectMapper.createObjectNode();
            
            // Collect broker metadata
            ObjectNode brokerInfo = getBrokerMetadata(targetIp, instance.getPort());
            if (brokerInfo != null) allInfo.set("broker", brokerInfo);
            
            // Collect cluster metadata
            ObjectNode clusterMetadata = getClusterMetadata(targetIp, instance.getPort());
            if (clusterMetadata != null) allInfo.set("cluster", clusterMetadata);
            
            // Collect topic information
            ObjectNode topicInfo = getTopicInfo(targetIp, instance.getPort());
            if (topicInfo != null) allInfo.set("topics", topicInfo);
            
            // Collect consumer group info
            ObjectNode consumerInfo = getConsumerGroupInfo(targetIp, instance.getPort());
            if (consumerInfo != null) allInfo.set("consumers", consumerInfo);
            
            return allInfo.toString();
        }
    }
    
    private ObjectNode getBrokerMetadata(String host, int port) {
        try {
            ObjectNode broker = objectMapper.createObjectNode();
            
            // Simulate broker metadata collection
            // In real implementation, use Kafka Admin API
            broker.put("broker_id", 1);
            broker.put("host", host);
            broker.put("port", port);
            broker.put("rack", "rack1");
            broker.put("endpoints", "PLAINTEXT://" + host + ":" + port);
            
            return broker;
        } catch (Exception e) {
            LOG.debug("Failed to get broker metadata: {}", e.getMessage());
            return null;
        }
    }
    
    private ObjectNode getClusterMetadata(String host, int port) {
        try {
            ObjectNode cluster = objectMapper.createObjectNode();
            
            // Simulate cluster metadata
            cluster.put("cluster_id", "kafka-cluster-1");
            cluster.put("controller_id", 1);
            cluster.put("total_brokers", 3);
            cluster.put("active_brokers", 3);
            cluster.put("under_replicated_partitions", 0);
            cluster.put("offline_partitions", 0);
            cluster.put("leader_elections_per_sec", 0.0);
            cluster.put("unclean_leader_elections_per_sec", 0.0);
            
            return cluster;
        } catch (Exception e) {
            LOG.debug("Failed to get cluster metadata: {}", e.getMessage());
            return null;
        }
    }
    
    private ObjectNode getTopicInfo(String host, int port) {
        try {
            ObjectNode topics = objectMapper.createObjectNode();
            
            // Simulate topic information
            topics.put("total_topics", 5);
            topics.put("total_partitions", 15);
            topics.put("total_replicas", 45);
            
            ArrayNode topicList = objectMapper.createArrayNode();
            
            // Sample topics
            ObjectNode topic1 = objectMapper.createObjectNode();
            topic1.put("name", "orders");
            topic1.put("partitions", 3);
            topic1.put("replication_factor", 3);
            topic1.put("in_sync_replicas", 3);
            topicList.add(topic1);
            
            ObjectNode topic2 = objectMapper.createObjectNode();
            topic2.put("name", "events");
            topic2.put("partitions", 6);
            topic2.put("replication_factor", 3);
            topic2.put("in_sync_replicas", 3);
            topicList.add(topic2);
            
            topics.set("topic_details", topicList);
            
            return topics;
        } catch (Exception e) {
            LOG.debug("Failed to get topic info: {}", e.getMessage());
            return null;
        }
    }
    
    private ObjectNode getConsumerGroupInfo(String host, int port) {
        try {
            ObjectNode consumers = objectMapper.createObjectNode();
            
            // Simulate consumer group information
            consumers.put("total_consumer_groups", 3);
            consumers.put("active_consumer_groups", 3);
            consumers.put("total_lag", 150);
            
            ArrayNode groupList = objectMapper.createArrayNode();
            
            ObjectNode group1 = objectMapper.createObjectNode();
            group1.put("group_id", "order-processors");
            group1.put("state", "Stable");
            group1.put("members", 2);
            group1.put("lag", 50);
            groupList.add(group1);
            
            ObjectNode group2 = objectMapper.createObjectNode();
            group2.put("group_id", "analytics");
            group2.put("state", "Stable");
            group2.put("members", 1);
            group2.put("lag", 100);
            groupList.add(group2);
            
            consumers.set("group_details", groupList);
            
            return consumers;
        } catch (Exception e) {
            LOG.debug("Failed to get consumer group info: {}", e.getMessage());
            return null;
        }
    }

    private void createClusterHeartbeat(uptime.observability.domain.Service service, ServiceInstance connectedInstance, String clusterInfo) {
        Instant startTime = Instant.now();
        ServiceHeartbeat heartbeat = new ServiceHeartbeat();
        heartbeat.setService(service);
        heartbeat.setServiceInstance(null); // Cluster-level heartbeat
        heartbeat.setExecutedAt(startTime);

        if (clusterInfo != null && connectedInstance != null) {
            try {
                JsonNode allInfo = objectMapper.readTree(clusterInfo);
                ObjectNode metadata = objectMapper.createObjectNode();
                
                // Add all collected info
                if (allInfo.has("broker")) metadata.set("broker", allInfo.get("broker"));
                if (allInfo.has("cluster")) metadata.set("cluster", allInfo.get("cluster"));
                if (allInfo.has("topics")) metadata.set("topics", allInfo.get("topics"));
                if (allInfo.has("consumers")) metadata.set("consumers", allInfo.get("consumers"));
                
                metadata.put("connected_node", connectedInstance.getInstanceName() + ":" + connectedInstance.getPort());
                
                heartbeat.setSuccess(true);
                heartbeat.setStatus(determineClusterStatus(allInfo));
                heartbeat.setMetadata(metadata);
                heartbeat.setResponseTimeMs(1);
            } catch (Exception e) {
                LOG.warn("Failed to parse Kafka cluster info: {}", e.getMessage());
                heartbeat.setSuccess(false);
                heartbeat.setStatus(ServiceStatus.CRITICAL);
                heartbeat.setErrorMessage("Failed to parse cluster info: " + e.getMessage());
            }
        } else {
            heartbeat.setSuccess(false);
            heartbeat.setStatus(ServiceStatus.DOWN);
            heartbeat.setErrorMessage("Unable to connect to any Kafka broker");
        }

        serviceHeartbeatRepository.save(heartbeat);
    }

    private ServiceStatus determineClusterStatus(JsonNode allInfo) {
        JsonNode cluster = allInfo.path("cluster");
        JsonNode topics = allInfo.path("topics");
        JsonNode consumers = allInfo.path("consumers");
        
        int totalBrokers = cluster.path("total_brokers").asInt();
        int activeBrokers = cluster.path("active_brokers").asInt();
        int underReplicatedPartitions = cluster.path("under_replicated_partitions").asInt();
        int offlinePartitions = cluster.path("offline_partitions").asInt();
        long totalLag = consumers.path("total_lag").asLong();
        
        // Critical conditions
        if (offlinePartitions > 0 || activeBrokers < totalBrokers / 2) {
            return ServiceStatus.CRITICAL;
        }
        
        // Warning conditions
        if (underReplicatedPartitions > 0 || totalLag > 1000 || activeBrokers < totalBrokers) {
            return ServiceStatus.WARNING;
        }
        
        // All good
        if (activeBrokers == totalBrokers && underReplicatedPartitions == 0) {
            return ServiceStatus.UP;
        }
        
        return ServiceStatus.DEGRADED;
    }
    
    private String getTargetIpAddress(ServiceInstance serviceInstance) {
        if (serviceInstance.getInstancePrivateIpAddress() != null && !serviceInstance.getInstancePrivateIpAddress().trim().isEmpty()) {
            return serviceInstance.getInstancePrivateIpAddress().trim();
        }
        if (serviceInstance.getInstancePublicIpAddress() != null && !serviceInstance.getInstancePublicIpAddress().trim().isEmpty()) {
            return serviceInstance.getInstancePublicIpAddress().trim();
        }
        return null;
    }
}