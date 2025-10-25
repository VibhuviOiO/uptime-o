package uptime.observability.repository;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.AuditLog;

/**
 * Spring Data JPA repository for the AuditLog entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    @Query("select auditLog from AuditLog auditLog where auditLog.user.login = ?#{authentication.name}")
    List<AuditLog> findByUserIsCurrentUser();
}
