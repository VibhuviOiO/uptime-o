package uptime.observability.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.InstanceHeartbeat;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstanceHeartbeatRepository extends JpaRepository<InstanceHeartbeat, Long> {

    Optional<InstanceHeartbeat> findFirstByInstanceIdOrderByExecutedAtDesc(Long instanceId);
    
    List<InstanceHeartbeat> findByInstanceIdOrderByExecutedAtDesc(Long instanceId);
}