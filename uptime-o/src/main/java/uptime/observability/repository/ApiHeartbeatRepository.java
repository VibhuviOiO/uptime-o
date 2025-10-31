package uptime.observability.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.ApiHeartbeat;

import java.time.Instant;
import java.util.List;

/**
 * Spring Data JPA repository for the ApiHeartbeat entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ApiHeartbeatRepository extends JpaRepository<ApiHeartbeat, Long> {
    List<ApiHeartbeat> findByExecutedAtAfter(Instant from);
}
