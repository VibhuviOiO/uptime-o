package uptime.observability.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.ServiceHeartbeat;
import uptime.observability.domain.Service;

import java.util.Optional;

@Repository
public interface ServiceHeartbeatRepository extends JpaRepository<ServiceHeartbeat, Long> {
    
    Optional<ServiceHeartbeat> findFirstByServiceAndServiceInstanceIsNullOrderByExecutedAtDesc(Service service);
    
    Optional<ServiceHeartbeat> findFirstByServiceIdAndServiceInstanceIsNullOrderByExecutedAtDesc(Long serviceId);
    
    @Query("SELECT COUNT(DISTINCT sh.serviceInstance.id) FROM ServiceHeartbeat sh WHERE sh.service = :service AND sh.serviceInstance IS NOT NULL")
    long countDistinctServiceInstancesByService(Service service);
    
    @Query("SELECT COUNT(DISTINCT sh.serviceInstance.id) FROM ServiceHeartbeat sh WHERE sh.service = :service AND sh.serviceInstance IS NOT NULL AND sh.success = true")
    long countHealthyInstancesByService(Service service);
}
