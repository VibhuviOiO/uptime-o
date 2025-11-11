package uptime.observability.web.rest;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uptime.observability.domain.AgentLock;
import uptime.observability.repository.AgentLockRepository;

/**
 * Public REST controller for agent leader election via distributed locking.
 */
@RestController
@RequestMapping("/api/public/agents")
public class PublicAgentLockResource {

    private static final Logger LOG = LoggerFactory.getLogger(PublicAgentLockResource.class);
    private static final int LOCK_TTL_SECONDS = 60;

    private final AgentLockRepository agentLockRepository;

    public PublicAgentLockResource(AgentLockRepository agentLockRepository) {
        this.agentLockRepository = agentLockRepository;
    }

    /**
     * {@code POST  /api/public/agents/:id/lock} : Acquire leadership lock for agent.
     *
     * @param id the agent ID.
     * @return 200 OK if lock acquired, 409 CONFLICT if lock held by another instance.
     */
    @PostMapping("/{id}/lock")
    public ResponseEntity<Void> acquireLock(@PathVariable Long id) {
        LOG.debug("Agent {} attempting to acquire lock", id);

        Optional<AgentLock> existingLock = agentLockRepository.findById(id);
        Instant now = Instant.now();

        if (existingLock.isPresent()) {
            AgentLock lock = existingLock.get();
            // Check if lock is expired
            if (lock.getExpiresAt().isAfter(now)) {
                LOG.debug("Lock for agent {} is held by another instance", id);
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            // Lock expired, update it
            lock.setAcquiredAt(now);
            lock.setExpiresAt(now.plus(LOCK_TTL_SECONDS, ChronoUnit.SECONDS));
            agentLockRepository.save(lock);
            LOG.info("Agent {} acquired expired lock", id);
            return ResponseEntity.ok().build();
        }

        // Create new lock
        AgentLock newLock = new AgentLock();
        newLock.setAgentId(id);
        newLock.setAcquiredAt(now);
        newLock.setExpiresAt(now.plus(LOCK_TTL_SECONDS, ChronoUnit.SECONDS));
        agentLockRepository.save(newLock);

        LOG.info("Agent {} acquired new lock", id);
        return ResponseEntity.ok().build();
    }

    /**
     * {@code DELETE  /api/public/agents/:id/lock} : Release leadership lock for agent.
     *
     * @param id the agent ID.
     * @return 200 OK.
     */
    @DeleteMapping("/{id}/lock")
    public ResponseEntity<Void> releaseLock(@PathVariable Long id) {
        LOG.debug("Agent {} releasing lock", id);
        agentLockRepository.deleteById(id);
        LOG.info("Agent {} released lock", id);
        return ResponseEntity.ok().build();
    }
}
