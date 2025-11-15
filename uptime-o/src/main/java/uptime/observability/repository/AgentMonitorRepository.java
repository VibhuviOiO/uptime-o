package uptime.observability.repository;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
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
     * Find all active agent monitors by agent ID with monitor and schedule eagerly loaded.
     * This prevents LazyInitializationException when accessing monitor.schedule outside of transaction.
     *
     * @param agentId the agent ID
     * @param active the active status
     * @return list of active agent monitors with monitors and schedules loaded
     */
    @Query("SELECT DISTINCT am FROM AgentMonitor am " +
           "JOIN FETCH am.monitor m " +
           "WHERE am.agent.id = :agentId AND am.active = :active")
    List<AgentMonitor> findByAgentIdAndActiveWithMonitorAndSchedule(@Param("agentId") Long agentId, @Param("active") Boolean active);

    /**
     * Check if an agent monitor exists for a specific agent and monitor combination.
     *
     * @param agentId the agent ID
     * @param monitorId the monitor ID
     * @return true if exists, false otherwise
     */
    boolean existsByAgentIdAndMonitorId(Long agentId, Long monitorId);

    /**
     * Find all active agent monitors with monitor, agent, datacenter, and region eagerly loaded.
     *
     * @param active the active status
     * @return list of active agent monitors with all relationships loaded
     */
    @Query("SELECT DISTINCT am FROM AgentMonitor am " +
           "JOIN FETCH am.monitor m " +
           "JOIN FETCH am.agent a " +
           "LEFT JOIN FETCH a.region r " +
           "WHERE am.active = :active")
    List<AgentMonitor> findByActiveWithRelationships(@Param("active") Boolean active);
}
