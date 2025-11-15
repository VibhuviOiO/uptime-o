package uptime.observability.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.HttpHeartbeat;

import java.time.Instant;
import java.util.List;

/**
 * Spring Data JPA repository for the HttpHeartbeat entity.
 */
@SuppressWarnings("unused")
@Repository
public interface HttpHeartbeatRepository extends JpaRepository<HttpHeartbeat, Long> {
    
    @Query("SELECT DISTINCT h FROM HttpHeartbeat h LEFT JOIN FETCH h.monitor m LEFT JOIN FETCH h.agent a LEFT JOIN FETCH a.region WHERE h.executedAt > :from")
    List<HttpHeartbeat> findByExecutedAtAfter(Instant from);

    List<HttpHeartbeat> findByExecutedAtBetween(Instant from, Instant to);



    @Query("SELECT DISTINCT h FROM HttpHeartbeat h LEFT JOIN FETCH h.agent a LEFT JOIN FETCH a.region WHERE h.monitor.id = :monitorId ORDER BY h.executedAt DESC")
    List<HttpHeartbeat> findByMonitorIdOrderByExecutedAtDesc(Long monitorId);

    @Query("SELECT DISTINCT h FROM HttpHeartbeat h LEFT JOIN FETCH h.agent a LEFT JOIN FETCH a.region WHERE h.monitor.id = :monitorId AND h.executedAt BETWEEN :startTime AND :endTime ORDER BY h.executedAt DESC")
    List<HttpHeartbeat> findByMonitorIdAndExecutedAtBetweenOrderByExecutedAtDesc(Long monitorId, Instant startTime, Instant endTime);

    @Query("SELECT COUNT(DISTINCT h.agent.id) FROM HttpHeartbeat h WHERE h.monitor.id = :monitorId")
    Integer countDistinctAgentsByMonitorId(Long monitorId);
}
