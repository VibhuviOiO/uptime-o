package uptime.observability.repository;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.InstanceHeartbeat;

@Repository
public interface InstanceHeartbeatRepository extends JpaRepository<InstanceHeartbeat, Long> {
    List<InstanceHeartbeat> findByInstanceIdOrderByExecutedAtDesc(Long instanceId);
    
    @Query("SELECT p FROM InstanceHeartbeat p WHERE p.instanceId = :instanceId ORDER BY p.executedAt DESC")
    List<InstanceHeartbeat> findLatestByInstance(@Param("instanceId") Long instanceId);
    
    @Query("SELECT p FROM InstanceHeartbeat p ORDER BY p.executedAt DESC")
    List<InstanceHeartbeat> findAllOrderByExecutedAtDesc();
    
    @Query("SELECT ih, i.name, COALESCE(i.privateIpAddress, i.publicIpAddress) " +
           "FROM InstanceHeartbeat ih JOIN Instance i ON ih.instanceId = i.id " +
           "ORDER BY ih.executedAt DESC")
    List<Object[]> findAllWithInstanceDetails(org.springframework.data.domain.Pageable pageable);
}
