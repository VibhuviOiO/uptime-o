package uptime.observability.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.DatacenterMonitor;

/**
 * Spring Data JPA repository for the DatacenterMonitor entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DatacenterMonitorRepository extends JpaRepository<DatacenterMonitor, Long> {}
