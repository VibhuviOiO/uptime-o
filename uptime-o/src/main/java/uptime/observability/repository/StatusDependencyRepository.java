package uptime.observability.repository;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.StatusDependency;

/**
 * Spring Data JPA repository for the StatusDependency entity.
 */
@SuppressWarnings("unused")
@Repository
public interface StatusDependencyRepository extends JpaRepository<StatusDependency, Long> {
    List<StatusDependency> findByStatusPageId(Long statusPageId);
}