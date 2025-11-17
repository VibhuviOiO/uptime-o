package uptime.observability.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.HttpMonitor;

import java.util.List;

/**
 * Spring Data JPA repository for the HttpMonitor entity.
 */
@SuppressWarnings("unused")
@Repository
public interface HttpMonitorRepository extends JpaRepository<HttpMonitor, Long> {
    
    List<HttpMonitor> findByEnabledTrue();
}
