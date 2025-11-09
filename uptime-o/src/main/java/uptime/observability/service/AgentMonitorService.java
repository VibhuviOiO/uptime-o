package uptime.observability.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptime.observability.domain.Agent;
import uptime.observability.domain.AgentMonitor;
import uptime.observability.domain.HttpMonitor;
import uptime.observability.repository.AgentMonitorRepository;
import uptime.observability.repository.AgentRepository;
import uptime.observability.repository.HttpMonitorRepository;
import uptime.observability.service.dto.AgentMonitorDTO;
import uptime.observability.service.mapper.AgentMonitorMapper;

/**
 * Service Implementation for managing {@link AgentMonitor}.
 */
@Service
@Transactional
public class AgentMonitorService {

    private static final Logger log = LoggerFactory.getLogger(AgentMonitorService.class);

    private final AgentMonitorRepository agentMonitorRepository;
    private final AgentMonitorMapper agentMonitorMapper;
    private final AgentRepository agentRepository;
    private final HttpMonitorRepository httpMonitorRepository;

    public AgentMonitorService(
        AgentMonitorRepository agentMonitorRepository,
        AgentMonitorMapper agentMonitorMapper,
        AgentRepository agentRepository,
        HttpMonitorRepository httpMonitorRepository
    ) {
        this.agentMonitorRepository = agentMonitorRepository;
        this.agentMonitorMapper = agentMonitorMapper;
        this.agentRepository = agentRepository;
        this.httpMonitorRepository = httpMonitorRepository;
    }

    /**
     * Save a agentMonitor.
     *
     * @param agentMonitorDTO the entity to save.
     * @return the persisted entity.
     */
    public AgentMonitorDTO save(AgentMonitorDTO agentMonitorDTO) {
        log.debug("Request to save AgentMonitor : {}", agentMonitorDTO);
        
        // Check if association already exists
        if (agentMonitorRepository.existsByAgentIdAndMonitorId(
            agentMonitorDTO.getAgentId(), 
            agentMonitorDTO.getMonitorId()
        )) {
            throw new IllegalArgumentException("Agent is already assigned to this monitor");
        }

        AgentMonitor agentMonitor = agentMonitorMapper.toEntity(agentMonitorDTO);
        
        // Set agent and monitor relationships
        Agent agent = agentRepository.findById(agentMonitorDTO.getAgentId())
            .orElseThrow(() -> new IllegalArgumentException("Agent not found with id: " + agentMonitorDTO.getAgentId()));
        HttpMonitor monitor = httpMonitorRepository.findById(agentMonitorDTO.getMonitorId())
            .orElseThrow(() -> new IllegalArgumentException("Monitor not found with id: " + agentMonitorDTO.getMonitorId()));
        
        agentMonitor.setAgent(agent);
        agentMonitor.setMonitor(monitor);
        
        agentMonitor = agentMonitorRepository.save(agentMonitor);
        return agentMonitorMapper.toDto(agentMonitor);
    }

    /**
     * Update a agentMonitor.
     *
     * @param agentMonitorDTO the entity to save.
     * @return the persisted entity.
     */
    public AgentMonitorDTO update(AgentMonitorDTO agentMonitorDTO) {
        log.debug("Request to update AgentMonitor : {}", agentMonitorDTO);
        
        AgentMonitor agentMonitor = agentMonitorRepository
            .findById(agentMonitorDTO.getId())
            .orElseThrow(() -> new IllegalArgumentException("AgentMonitor not found with id: " + agentMonitorDTO.getId()));
        
        // Update only the active status
        agentMonitor.setActive(agentMonitorDTO.getActive());
        
        agentMonitor = agentMonitorRepository.save(agentMonitor);
        return agentMonitorMapper.toDto(agentMonitor);
    }

    /**
     * Partially update a agentMonitor.
     *
     * @param agentMonitorDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<AgentMonitorDTO> partialUpdate(AgentMonitorDTO agentMonitorDTO) {
        log.debug("Request to partially update AgentMonitor : {}", agentMonitorDTO);

        return agentMonitorRepository
            .findById(agentMonitorDTO.getId())
            .map(existingAgentMonitor -> {
                if (agentMonitorDTO.getActive() != null) {
                    existingAgentMonitor.setActive(agentMonitorDTO.getActive());
                }
                return existingAgentMonitor;
            })
            .map(agentMonitorRepository::save)
            .map(agentMonitorMapper::toDto);
    }

    /**
     * Get all the agentMonitors.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<AgentMonitorDTO> findAll() {
        log.debug("Request to get all AgentMonitors");
        return agentMonitorRepository.findAll().stream()
            .map(agentMonitorMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one agentMonitor by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<AgentMonitorDTO> findOne(Long id) {
        log.debug("Request to get AgentMonitor : {}", id);
        return agentMonitorRepository.findById(id).map(agentMonitorMapper::toDto);
    }

    /**
     * Get all agentMonitors by agent id.
     *
     * @param agentId the agent id.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<AgentMonitorDTO> findByAgentId(Long agentId) {
        log.debug("Request to get AgentMonitors by agent id : {}", agentId);
        return agentMonitorRepository.findByAgentId(agentId).stream()
            .map(agentMonitorMapper::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Get all agentMonitors by monitor id.
     *
     * @param monitorId the monitor id.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<AgentMonitorDTO> findByMonitorId(Long monitorId) {
        log.debug("Request to get AgentMonitors by monitor id : {}", monitorId);
        return agentMonitorRepository.findByMonitorId(monitorId).stream()
            .map(agentMonitorMapper::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Delete the agentMonitor by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete AgentMonitor : {}", id);
        agentMonitorRepository.deleteById(id);
    }
}
