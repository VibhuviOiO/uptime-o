package uptime.observability.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.Datacenter;
import uptime.observability.domain.HttpHeartbeat;

import java.time.Instant;
import java.util.List;

/**
 * Spring Data JPA repository for the HttpHeartbeat entity.
 */
@SuppressWarnings("unused")
@Repository
public interface HttpHeartbeatRepository extends JpaRepository<HttpHeartbeat, Long> {
    
    @Query("SELECT DISTINCT h FROM HttpHeartbeat h LEFT JOIN FETCH h.monitor m LEFT JOIN FETCH h.agent a LEFT JOIN FETCH a.datacenter d LEFT JOIN FETCH d.region WHERE h.executedAt > :from")
    List<HttpHeartbeat> findByExecutedAtAfter(Instant from);

    List<HttpHeartbeat> findByExecutedAtBetween(Instant from, Instant to);

    @Query("SELECT h FROM HttpHeartbeat h WHERE h.agent.datacenter = :datacenter AND h.executedAt >= :from")
    List<HttpHeartbeat> findByDatacenterAndExecutedAtAfter(Datacenter datacenter, Instant from);

    @Query("SELECT DISTINCT h FROM HttpHeartbeat h LEFT JOIN FETCH h.agent a LEFT JOIN FETCH a.datacenter dc LEFT JOIN FETCH dc.region WHERE h.monitor.id = :monitorId ORDER BY h.executedAt DESC")
    List<HttpHeartbeat> findByMonitorIdOrderByExecutedAtDesc(Long monitorId);

    @Query("SELECT DISTINCT h FROM HttpHeartbeat h LEFT JOIN FETCH h.agent a LEFT JOIN FETCH a.datacenter dc LEFT JOIN FETCH dc.region WHERE h.monitor.id = :monitorId AND h.executedAt BETWEEN :startTime AND :endTime ORDER BY h.executedAt DESC")
    List<HttpHeartbeat> findByMonitorIdAndExecutedAtBetweenOrderByExecutedAtDesc(Long monitorId, Instant startTime, Instant endTime);

    @Query("SELECT COUNT(DISTINCT h.agent.id) FROM HttpHeartbeat h WHERE h.monitor.id = :monitorId")
    Integer countDistinctAgentsByMonitorId(Long monitorId);



    @Query(value = """
        WITH latest_heartbeats AS (
          SELECT 
            h.*,
            ROW_NUMBER() OVER (PARTITION BY h.monitor_id ORDER BY h.executed_at DESC) as rn
          FROM api_heartbeats h
        ),
        agent_counts AS (
          SELECT 
            monitor_id,
            COUNT(DISTINCT agent_id) as agent_count
          FROM api_heartbeats
          GROUP BY monitor_id
        )
        SELECT 
          m.id as monitor_id,
          m.name as monitor_name,
          h.success as last_success,
          h.response_time_ms as last_latency_ms,
          h.executed_at as last_checked_time,
          r.name as region_name,
          d.name as datacenter_name,
          a.name as agent_name,
          COALESCE(ac.agent_count, 0) as agent_count
        FROM api_monitors m
        LEFT JOIN latest_heartbeats h ON m.id = h.monitor_id AND h.rn = 1
        LEFT JOIN agents a ON h.agent_id = a.id
        LEFT JOIN datacenters d ON a.datacenter_id = d.id
        LEFT JOIN regions r ON d.region_id = r.id
        LEFT JOIN agent_counts ac ON m.id = ac.monitor_id
        WHERE 1=1
          AND (:searchName IS NULL OR :searchName = '' OR LOWER(m.name) LIKE LOWER(CONCAT('%', :searchName, '%')))
          AND (:regionName IS NULL OR :regionName = '' OR LOWER(r.name) = LOWER(:regionName))
          AND (:datacenterName IS NULL OR :datacenterName = '' OR LOWER(d.name) = LOWER(:datacenterName))
          AND (:agentName IS NULL OR :agentName = '' OR LOWER(a.name) LIKE LOWER(CONCAT('%', :agentName, '%')))
        ORDER BY m.name
        """, nativeQuery = true)
    List<Object[]> findAggregatedMetrics(
        @org.springframework.data.repository.query.Param("searchName") String searchName,
        @org.springframework.data.repository.query.Param("regionName") String regionName,
        @org.springframework.data.repository.query.Param("datacenterName") String datacenterName,
        @org.springframework.data.repository.query.Param("agentName") String agentName
    );
}
