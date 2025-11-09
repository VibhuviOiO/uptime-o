package uptime.observability.repository;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.AgentMonitor;

/**
 * Spring Data JPA repository for the AgentMonitor entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AgentMonitorRepository extends JpaRepository<AgentMonitor, Long> {
    /**
     * Find all agent monitors by agent ID.
     *
     * @param agentId the agent ID
     * @return list of agent monitors
     */
    List<AgentMonitor> findByAgentId(Long agentId);

    /**
     * Find all agent monitors by monitor ID.
     *
     * @param monitorId the monitor ID
     * @return list of agent monitors
     */
    List<AgentMonitor> findByMonitorId(Long monitorId);

    /**
     * Find all active agent monitors by monitor ID.
     *
     * @param monitorId the monitor ID
     * @param active the active status
     * @return list of active agent monitors
     */
    List<AgentMonitor> findByMonitorIdAndActive(Long monitorId, Boolean active);

    /**
     * Find all active agent monitors by agent ID.
     *
     * @param agentId the agent ID
     * @param active the active status
     * @return list of active agent monitors
     */
    List<AgentMonitor> findByAgentIdAndActive(Long agentId, Boolean active);

    /**
     * Check if an agent monitor exists for a specific agent and monitor combination.
     *
     * @param agentId the agent ID
     * @param monitorId the monitor ID
     * @return true if exists, false otherwise
     */
    boolean existsByAgentIdAndMonitorId(Long agentId, Long monitorId);
}
