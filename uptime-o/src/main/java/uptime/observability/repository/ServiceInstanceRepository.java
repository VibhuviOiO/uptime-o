package uptime.observability.repository;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.ServiceInstance;

@Repository
public interface ServiceInstanceRepository extends JpaRepository<ServiceInstance, Long> {
    List<ServiceInstance> findByServiceId(Long serviceId);
}
