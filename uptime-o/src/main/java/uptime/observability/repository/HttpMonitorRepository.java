package uptime.observability.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.HttpMonitor;

/**
 * Spring Data JPA repository for the HttpMonitor entity.
 */
@SuppressWarnings("unused")
@Repository
public interface HttpMonitorRepository extends JpaRepository<HttpMonitor, Long> {}
