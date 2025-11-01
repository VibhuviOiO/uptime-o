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
    
    List<HttpHeartbeat> findByExecutedAtAfter(Instant from);

    List<HttpHeartbeat> findByExecutedAtBetween(Instant from, Instant to);

    @Query("SELECT h FROM HttpHeartbeat h WHERE h.agent.datacenter = :datacenter AND h.executedAt >= :from")
    List<HttpHeartbeat> findByDatacenterAndExecutedAtAfter(Datacenter datacenter, Instant from);
}
