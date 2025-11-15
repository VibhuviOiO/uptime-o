package uptime.observability.repository;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.InstanceHeartbeat;

@Repository
public interface InstanceHeartbeatRepository extends JpaRepository<InstanceHeartbeat, Long> {
    List<InstanceHeartbeat> findByInstanceIdOrderByExecutedAtDesc(Long instanceId);
    
    @Query("SELECT p FROM InstanceHeartbeat p WHERE p.instanceId = :instanceId ORDER BY p.executedAt DESC")
    List<InstanceHeartbeat> findLatestByInstance(@Param("instanceId") Long instanceId);
}
