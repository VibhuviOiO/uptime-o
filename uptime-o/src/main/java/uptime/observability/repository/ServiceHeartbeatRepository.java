package uptime.observability.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.ServiceHeartbeat;

@Repository
public interface ServiceHeartbeatRepository extends JpaRepository<ServiceHeartbeat, Long> {}
