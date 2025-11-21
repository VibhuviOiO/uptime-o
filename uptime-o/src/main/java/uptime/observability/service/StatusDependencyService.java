package uptime.observability.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import uptime.observability.domain.StatusDependency;
import uptime.observability.domain.enumeration.DependencyType;
import uptime.observability.repository.StatusDependencyRepository;
import uptime.observability.service.dto.DependencyTreeDTO;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatusDependencyService {

    private static final Logger LOG = LoggerFactory.getLogger(StatusDependencyService.class);

    private final StatusDependencyRepository statusDependencyRepository;
    private final uptime.observability.repository.HttpHeartbeatRepository httpHeartbeatRepository;
    private final uptime.observability.repository.ServiceHeartbeatRepository serviceHeartbeatRepository;
    private final uptime.observability.repository.InstanceHeartbeatRepository instanceHeartbeatRepository;
    private final uptime.observability.repository.HttpMonitorRepository httpMonitorRepository;
    private final uptime.observability.repository.ServiceRepository serviceRepository;
    private final uptime.observability.repository.InstanceRepository instanceRepository;

    public StatusDependencyService(
        StatusDependencyRepository statusDependencyRepository,
        uptime.observability.repository.HttpHeartbeatRepository httpHeartbeatRepository,
        uptime.observability.repository.ServiceHeartbeatRepository serviceHeartbeatRepository,
        uptime.observability.repository.InstanceHeartbeatRepository instanceHeartbeatRepository,
        uptime.observability.repository.HttpMonitorRepository httpMonitorRepository,
        uptime.observability.repository.ServiceRepository serviceRepository,
        uptime.observability.repository.InstanceRepository instanceRepository
    ) {
        this.statusDependencyRepository = statusDependencyRepository;
        this.httpHeartbeatRepository = httpHeartbeatRepository;
        this.serviceHeartbeatRepository = serviceHeartbeatRepository;
        this.instanceHeartbeatRepository = instanceHeartbeatRepository;
        this.httpMonitorRepository = httpMonitorRepository;
        this.serviceRepository = serviceRepository;
        this.instanceRepository = instanceRepository;
    }

    public List<DependencyTreeDTO> getDependencyTree() {
        List<StatusDependency> dependencies = statusDependencyRepository.findAll();
        if (dependencies.isEmpty()) {
            return Collections.emptyList();
        }

        // Collect all unique IDs by type
        Set<Long> httpIds = new HashSet<>();
        Set<Long> serviceIds = new HashSet<>();
        Set<Long> instanceIds = new HashSet<>();
        
        dependencies.forEach(dep -> {
            if (dep.getParentType() == DependencyType.HTTP) httpIds.add(dep.getParentId());
            else if (dep.getParentType() == DependencyType.SERVICE) serviceIds.add(dep.getParentId());
            else if (dep.getParentType() == DependencyType.INSTANCE) instanceIds.add(dep.getParentId());
            
            if (dep.getChildType() == DependencyType.HTTP) httpIds.add(dep.getChildId());
            else if (dep.getChildType() == DependencyType.SERVICE) serviceIds.add(dep.getChildId());
            else if (dep.getChildType() == DependencyType.INSTANCE) instanceIds.add(dep.getChildId());
        });

        // Fetch all items using repositories
        Map<String, String> itemMap = new HashMap<>();
        if (!httpIds.isEmpty()) {
            httpMonitorRepository.findAllById(httpIds).forEach(m -> 
                itemMap.put("HTTP-" + m.getId(), m.getName()));
        }
        if (!serviceIds.isEmpty()) {
            serviceRepository.findAllById(serviceIds).forEach(s -> 
                itemMap.put("SERVICE-" + s.getId(), s.getName()));
        }
        if (!instanceIds.isEmpty()) {
            instanceRepository.findAllById(instanceIds).forEach(i -> 
                itemMap.put("INSTANCE-" + i.getId(), i.getName()));
        }

        // Fetch latest heartbeats for status
        Map<String, HeartbeatInfo> heartbeatMap = fetchLatestHeartbeats(httpIds, serviceIds, instanceIds);

        // Build child map
        Map<String, List<String>> childMap = new HashMap<>();
        dependencies.forEach(dep -> {
            String parentKey = dep.getParentType() + "-" + dep.getParentId();
            String childKey = dep.getChildType() + "-" + dep.getChildId();
            childMap.computeIfAbsent(parentKey, k -> new ArrayList<>()).add(childKey);
        });

        // Find root nodes (parents that are not children)
        Set<String> allParents = dependencies.stream()
            .map(dep -> dep.getParentType() + "-" + dep.getParentId())
            .collect(Collectors.toSet());
        Set<String> allChildren = dependencies.stream()
            .map(dep -> dep.getChildType() + "-" + dep.getChildId())
            .collect(Collectors.toSet());
        
        Set<String> roots = allParents.stream()
            .filter(parent -> !allChildren.contains(parent))
            .collect(Collectors.toSet());

        // Build tree from roots
        return roots.stream()
            .map(rootKey -> buildNode(rootKey, itemMap, heartbeatMap, childMap, new HashSet<>()))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    private Map<String, HeartbeatInfo> fetchLatestHeartbeats(Set<Long> httpIds, Set<Long> serviceIds, Set<Long> instanceIds) {
        Map<String, HeartbeatInfo> heartbeatMap = new HashMap<>();
        
        if (!httpIds.isEmpty()) {
            httpIds.forEach(monitorId -> {
                httpHeartbeatRepository.findFirstByMonitorIdOrderByExecutedAtDesc(monitorId).ifPresent(hb -> {
                    String key = "HTTP-" + monitorId;
                    String metadata = String.format(
                        "{\"statusCode\":%d,\"dnsLookupMs\":%d,\"tcpConnectMs\":%d,\"tlsHandshakeMs\":%d,\"ttfbMs\":%d,\"responseSizeBytes\":%d}",
                        hb.getResponseStatusCode() != null ? hb.getResponseStatusCode() : 0,
                        hb.getDnsLookupMs() != null ? hb.getDnsLookupMs() : 0,
                        hb.getTcpConnectMs() != null ? hb.getTcpConnectMs() : 0,
                        hb.getTlsHandshakeMs() != null ? hb.getTlsHandshakeMs() : 0,
                        hb.getTimeToFirstByteMs() != null ? hb.getTimeToFirstByteMs() : 0,
                        hb.getResponseSizeBytes() != null ? hb.getResponseSizeBytes() : 0
                    );
                    heartbeatMap.put(key, new HeartbeatInfo(
                        hb.getSuccess() ? "UP" : "DOWN",
                        hb.getExecutedAt().toString(),
                        hb.getResponseTimeMs(),
                        hb.getErrorMessage(),
                        metadata
                    ));
                });
            });
        }
        
        if (!serviceIds.isEmpty()) {
            serviceIds.forEach(serviceId -> {
                serviceHeartbeatRepository.findFirstByServiceIdAndServiceInstanceIsNullOrderByExecutedAtDesc(serviceId)
                    .or(() -> serviceHeartbeatRepository.findFirstByServiceIdOrderByExecutedAtDesc(serviceId))
                    .ifPresent(hb -> {
                        String key = "SERVICE-" + serviceId;
                        heartbeatMap.put(key, new HeartbeatInfo(
                            hb.getSuccess() ? "UP" : "DOWN",
                            hb.getExecutedAt().toString(),
                            hb.getResponseTimeMs(),
                            hb.getErrorMessage(),
                            hb.getMetadata() != null ? hb.getMetadata().toString() : null
                        ));
                    });
            });
        }
        
        if (!instanceIds.isEmpty()) {
            instanceIds.forEach(instanceId -> {
                instanceHeartbeatRepository.findFirstByInstanceIdOrderByExecutedAtDesc(instanceId).ifPresent(hb -> {
                    String key = "INSTANCE-" + instanceId;
                    heartbeatMap.put(key, new HeartbeatInfo(
                        hb.getSuccess() ? "UP" : "DOWN",
                        hb.getExecutedAt().toString(),
                        hb.getResponseTimeMs(),
                        hb.getErrorMessage(),
                        null
                    ));
                });
            });
        }
        
        return heartbeatMap;
    }

    private DependencyTreeDTO buildNode(String key, Map<String, String> itemMap, Map<String, HeartbeatInfo> heartbeatMap, Map<String, List<String>> childMap, Set<String> visited) {
        if (visited.contains(key)) return null;
        visited.add(key);

        String name = itemMap.get(key);
        if (name == null) return null;

        String[] parts = key.split("-");
        DependencyType type = DependencyType.valueOf(parts[0]);
        Long id = Long.parseLong(parts[1]);

        HeartbeatInfo hb = heartbeatMap.getOrDefault(key, new HeartbeatInfo("UNKNOWN", null, null, null, null));
        DependencyTreeDTO node = new DependencyTreeDTO(key, name, type, id, hb.status, hb.lastChecked, hb.responseTimeMs, hb.errorMessage, hb.metadata);

        List<String> childKeys = childMap.getOrDefault(key, Collections.emptyList());
        List<DependencyTreeDTO> children = childKeys.stream()
            .map(childKey -> buildNode(childKey, itemMap, heartbeatMap, childMap, new HashSet<>(visited)))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
        
        node.setChildren(children);
        return node;
    }

    private static class HeartbeatInfo {
        String status;
        String lastChecked;
        Integer responseTimeMs;
        String errorMessage;
        String metadata;

        HeartbeatInfo(String status, String lastChecked, Integer responseTimeMs, String errorMessage, String metadata) {
            this.status = status;
            this.lastChecked = lastChecked;
            this.responseTimeMs = responseTimeMs;
            this.errorMessage = errorMessage;
            this.metadata = metadata;
        }
    }
}
