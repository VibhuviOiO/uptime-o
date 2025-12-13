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
    
    @Query("SELECT h FROM HttpHeartbeat h LEFT JOIN FETCH h.monitor LEFT JOIN FETCH h.agent ORDER BY h.executedAt DESC")
    List<HttpHeartbeat> findAllWithRelationships();
    
    @Query("SELECT DISTINCT h FROM HttpHeartbeat h LEFT JOIN FETCH h.monitor m LEFT JOIN FETCH h.agent a LEFT JOIN FETCH a.datacenter d LEFT JOIN FETCH d.region WHERE h.executedAt > :from")
    List<HttpHeartbeat> findByExecutedAtAfter(Instant from);

    List<HttpHeartbeat> findByExecutedAtBetween(Instant from, Instant to);

    @Query("SELECT h FROM HttpHeartbeat h WHERE h.agent.datacenter = :datacenter AND h.executedAt >= :from")
    List<HttpHeartbeat> findByDatacenterAndExecutedAtAfter(Datacenter datacenter, Instant from);

    @Query(value = "SELECT h.* FROM api_heartbeats h WHERE h.monitor_id = :monitorId ORDER BY h.executed_at DESC LIMIT 1000", nativeQuery = true)
    List<HttpHeartbeat> findByMonitorIdOrderByExecutedAtDesc(@org.springframework.data.repository.query.Param("monitorId") Long monitorId);

    @Query(value = "SELECT h.* FROM api_heartbeats h WHERE h.monitor_id = :monitorId AND h.executed_at BETWEEN :startTime AND :endTime ORDER BY h.executed_at DESC LIMIT 5000", nativeQuery = true)
    List<HttpHeartbeat> findByMonitorIdAndExecutedAtBetweenOrderByExecutedAtDesc(
        @org.springframework.data.repository.query.Param("monitorId") Long monitorId, 
        @org.springframework.data.repository.query.Param("startTime") Instant startTime, 
        @org.springframework.data.repository.query.Param("endTime") Instant endTime
    );

    @Query("SELECT COUNT(DISTINCT h.agent.id) FROM HttpHeartbeat h WHERE h.monitor.id = :monitorId")
    Integer countDistinctAgentsByMonitorId(Long monitorId);



    @Query(value = """
        SELECT DISTINCT ON (m.id)
          m.id as monitor_id,
          m.name as monitor_name,
          h.success as last_success,
          h.response_time_ms as last_latency_ms,
          h.executed_at as last_checked_time,
          r.name as region_name,
          d.name as datacenter_name,
          a.name as agent_name,
          (SELECT COUNT(DISTINCT agent_id) FROM api_heartbeats WHERE monitor_id = m.id) as agent_count
        FROM api_monitors m
        LEFT JOIN LATERAL (
          SELECT * FROM api_heartbeats 
          WHERE monitor_id = m.id 
          ORDER BY executed_at DESC 
          LIMIT 1
        ) h ON true
        LEFT JOIN agents a ON h.agent_id = a.id
        LEFT JOIN datacenters d ON a.datacenter_id = d.id
        LEFT JOIN regions r ON d.region_id = r.id
        WHERE (:searchName IS NULL OR :searchName = '' OR m.name ILIKE '%' || :searchName || '%')
          AND (:regionName IS NULL OR :regionName = '' OR r.name = :regionName)
          AND (:datacenterName IS NULL OR :datacenterName = '' OR d.name = :datacenterName)
          AND (:agentName IS NULL OR :agentName = '' OR a.name ILIKE '%' || :agentName || '%')
        ORDER BY m.name
        LIMIT 100
        """, nativeQuery = true)
    List<Object[]> findAggregatedMetrics(
        @org.springframework.data.repository.query.Param("searchName") String searchName,
        @org.springframework.data.repository.query.Param("regionName") String regionName,
        @org.springframework.data.repository.query.Param("datacenterName") String datacenterName,
        @org.springframework.data.repository.query.Param("agentName") String agentName
    );

    @Query(value = """
        SELECT DISTINCT ON (m.id, a.id)
          m.id as monitor_id,
          m.name as monitor_name,
          h.success as last_success,
          h.response_time_ms as last_latency_ms,
          h.executed_at as last_checked_time,
          r.name as region_name,
          d.name as datacenter_name,
          a.name as agent_name,
          1 as agent_count
        FROM api_monitors m
        INNER JOIN agents a ON true
        LEFT JOIN LATERAL (
          SELECT * FROM api_heartbeats 
          WHERE monitor_id = m.id AND agent_id = a.id
          ORDER BY executed_at DESC 
          LIMIT 1
        ) h ON true
        INNER JOIN datacenters d ON a.datacenter_id = d.id
        INNER JOIN regions r ON d.region_id = r.id
        WHERE h.id IS NOT NULL
          AND (:searchName IS NULL OR :searchName = '' OR m.name ILIKE '%' || :searchName || '%')
          AND (:regionName IS NULL OR :regionName = '' OR r.name = :regionName)
          AND (:datacenterName IS NULL OR :datacenterName = '' OR d.name = :datacenterName)
          AND (:agentName IS NULL OR :agentName = '' OR a.name ILIKE '%' || :agentName || '%')
        ORDER BY m.id, a.id, h.executed_at DESC
        LIMIT 200
        """, nativeQuery = true)
    List<Object[]> findIndividualMetrics(
        @org.springframework.data.repository.query.Param("searchName") String searchName,
        @org.springframework.data.repository.query.Param("regionName") String regionName,
        @org.springframework.data.repository.query.Param("datacenterName") String datacenterName,
        @org.springframework.data.repository.query.Param("agentName") String agentName
    );

}
