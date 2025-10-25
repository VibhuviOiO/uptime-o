package uptime.observability.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.Datacenter;

/**
 * Spring Data JPA repository for the Datacenter entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DatacenterRepository extends JpaRepository<Datacenter, Long> {}
