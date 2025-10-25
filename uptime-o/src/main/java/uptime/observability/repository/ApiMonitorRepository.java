package uptime.observability.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.ApiMonitor;

/**
 * Spring Data JPA repository for the ApiMonitor entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ApiMonitorRepository extends JpaRepository<ApiMonitor, Long> {}
