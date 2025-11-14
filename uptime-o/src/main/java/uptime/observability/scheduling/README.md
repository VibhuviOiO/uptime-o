# Scheduling Package

This package contains all scheduled monitoring tasks for SELF_HOSTED instances.

## Structure

```
scheduling/
├── SchedulingConfiguration.java   # Enable/disable all scheduling
└── ping/                          # ICMP ping monitoring
    └── PingMonitoringService.java
```

## Ping Monitoring

- **Schedule**: Every 30 seconds
- **Target**: SELF_HOSTED instances with `pingEnabled=true`
- **Method**: Java `InetAddress.isReachable()`
- **Output**: Records to `ping_heartbeats` table

## Disable Scheduling

Add to `application.yml`:
```yaml
scheduling:
  enabled: false
```

## Delete Scheduling

To completely remove:
```bash
rm -rf src/main/java/uptime/observability/scheduling/
```
