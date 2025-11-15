package uptime.observability.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.Service;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {}
