package uptime.observability.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.AgentLock;

/**
 * Spring Data JPA repository for the AgentLock entity.
 */
@Repository
public interface AgentLockRepository extends JpaRepository<AgentLock, Long> {}
