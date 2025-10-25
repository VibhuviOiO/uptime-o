package uptime.observability.service;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import uptime.observability.service.dto.AgentDTO;

/**
 * Service Interface for managing {@link uptime.observability.domain.Agent}.
 */
public interface AgentService {
    /**
     * Save a agent.
     *
     * @param agentDTO the entity to save.
     * @return the persisted entity.
     */
    AgentDTO save(AgentDTO agentDTO);

    /**
     * Updates a agent.
     *
     * @param agentDTO the entity to update.
     * @return the persisted entity.
     */
    AgentDTO update(AgentDTO agentDTO);

    /**
     * Partially updates a agent.
     *
     * @param agentDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<AgentDTO> partialUpdate(AgentDTO agentDTO);

    /**
     * Get all the agents.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<AgentDTO> findAll(Pageable pageable);

    /**
     * Get the "id" agent.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<AgentDTO> findOne(Long id);

    /**
     * Delete the "id" agent.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
