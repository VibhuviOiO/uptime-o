package uptime.observability.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.Instance;

@Repository
public interface InstanceRepository extends JpaRepository<Instance, Long> {
    @Query("SELECT i FROM Instance i LEFT JOIN FETCH i.datacenter")
    List<Instance> findAllWithDatacenter();
    
    @Query("SELECT i FROM Instance i LEFT JOIN FETCH i.datacenter WHERE i.id = :id")
    Optional<Instance> findOneWithDatacenter(Long id);
    
    List<Instance> findByDatacenterId(Long datacenterId);
    
    List<Instance> findByMonitoringType(uptime.observability.domain.MonitoringType monitoringType);
    
    List<Instance> findByAgentId(Long agentId);
    
    List<Instance> findByPingEnabledTrue();
    
    List<Instance> findByHardwareMonitoringEnabledTrue();
    
    @Query("SELECT i FROM Instance i WHERE i.pingEnabled = true AND i.monitoringType = uptime.observability.domain.MonitoringType.SELF_HOSTED")
    List<Instance> findSelfHostedWithPingEnabled();
}
