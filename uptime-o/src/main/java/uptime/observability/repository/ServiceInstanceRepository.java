package uptime.observability.repository;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.ServiceInstance;

@Repository
public interface ServiceInstanceRepository extends JpaRepository<ServiceInstance, Long> {
    List<ServiceInstance> findByServiceId(Long serviceId);
    
    @Query("SELECT si FROM ServiceInstance si JOIN FETCH si.instance WHERE si.service.id = :serviceId AND si.isActive = true")
    List<ServiceInstance> findByServiceIdAndIsActiveTrue(@Param("serviceId") Long serviceId);
}
