package uptime.observability.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.StatusPage;

/**
 * Spring Data JPA repository for the StatusPage entity.
 */
@SuppressWarnings("unused")
@Repository
public interface StatusPageRepository extends JpaRepository<StatusPage, Long> {
    Optional<StatusPage> findBySlug(String slug);
}