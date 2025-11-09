package uptime.observability.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.ApiKey;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for the ApiKey entity.
 */
@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    List<ApiKey> findAllByActiveTrue();
    
    Optional<ApiKey> findByKeyHash(String keyHash);
}
