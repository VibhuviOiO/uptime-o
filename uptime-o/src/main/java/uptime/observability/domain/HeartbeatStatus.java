package uptime.observability.domain;

public enum HeartbeatStatus {
    UP,
    DOWN,
    DEGRADED,
    WARNING,
    DANGER,
    TIMEOUT
}
