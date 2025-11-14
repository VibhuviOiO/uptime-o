package uptime.observability.service.mapper;

import org.springframework.stereotype.Service;
import uptime.observability.domain.PingHeartbeat;
import uptime.observability.service.dto.PingHeartbeatDTO;

@Service
public class PingHeartbeatMapper {

    public PingHeartbeatDTO toDto(PingHeartbeat entity) {
        if (entity == null) {
            return null;
        }

        PingHeartbeatDTO dto = new PingHeartbeatDTO();
        dto.setId(entity.getId());
        dto.setInstanceId(entity.getInstanceId());
        dto.setExecutedAt(entity.getExecutedAt());
        dto.setHeartbeatType(entity.getHeartbeatType());
        dto.setSuccess(entity.getSuccess());
        dto.setResponseTimeMs(entity.getResponseTimeMs());
        dto.setPacketLoss(entity.getPacketLoss());
        dto.setJitterMs(entity.getJitterMs());
        dto.setCpuUsage(entity.getCpuUsage());
        dto.setMemoryUsage(entity.getMemoryUsage());
        dto.setDiskUsage(entity.getDiskUsage());
        dto.setLoadAverage(entity.getLoadAverage());
        dto.setProcessCount(entity.getProcessCount());
        dto.setNetworkRxBytes(entity.getNetworkRxBytes());
        dto.setNetworkTxBytes(entity.getNetworkTxBytes());
        dto.setUptimeSeconds(entity.getUptimeSeconds());
        dto.setStatus(entity.getStatus());
        dto.setErrorMessage(entity.getErrorMessage());
        dto.setErrorType(entity.getErrorType());
        dto.setAgentId(entity.getAgentId());
        dto.setMetadata(entity.getMetadata());

        return dto;
    }

    public PingHeartbeat toEntity(PingHeartbeatDTO dto) {
        if (dto == null) {
            return null;
        }

        PingHeartbeat entity = new PingHeartbeat();
        entity.setId(dto.getId());
        entity.setInstanceId(dto.getInstanceId());
        entity.setExecutedAt(dto.getExecutedAt());
        entity.setHeartbeatType(dto.getHeartbeatType());
        entity.setSuccess(dto.getSuccess());
        entity.setResponseTimeMs(dto.getResponseTimeMs());
        entity.setPacketLoss(dto.getPacketLoss());
        entity.setJitterMs(dto.getJitterMs());
        entity.setCpuUsage(dto.getCpuUsage());
        entity.setMemoryUsage(dto.getMemoryUsage());
        entity.setDiskUsage(dto.getDiskUsage());
        entity.setLoadAverage(dto.getLoadAverage());
        entity.setProcessCount(dto.getProcessCount());
        entity.setNetworkRxBytes(dto.getNetworkRxBytes());
        entity.setNetworkTxBytes(dto.getNetworkTxBytes());
        entity.setUptimeSeconds(dto.getUptimeSeconds());
        entity.setStatus(dto.getStatus());
        entity.setErrorMessage(dto.getErrorMessage());
        entity.setErrorType(dto.getErrorType());
        entity.setAgentId(dto.getAgentId());
        entity.setMetadata(dto.getMetadata());

        return entity;
    }
}
