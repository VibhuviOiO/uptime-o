package uptime.observability.repository;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.PingHeartbeat;

@Repository
public interface PingHeartbeatRepository extends JpaRepository<PingHeartbeat, Long> {
    List<PingHeartbeat> findByInstanceIdOrderByExecutedAtDesc(Long instanceId);
    
    @Query("SELECT p FROM PingHeartbeat p WHERE p.instanceId = :instanceId ORDER BY p.executedAt DESC")
    List<PingHeartbeat> findLatestByInstance(@Param("instanceId") Long instanceId);
}
