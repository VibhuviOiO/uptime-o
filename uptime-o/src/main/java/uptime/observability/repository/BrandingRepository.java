package uptime.observability.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.Branding;

/**
 * Spring Data JPA repository for the Branding entity.
 */
@SuppressWarnings("unused")
@Repository
public interface BrandingRepository extends JpaRepository<Branding, Long> {
    Optional<Branding> findFirstByIsActiveTrue();
}