# Zero Monitors Handling

## Problem
When an agent has zero monitors assigned, it should continue checking for new monitors periodically, not just stop completely.

## Solution

### Dynamic Reload Interval
- **With monitors**: Uses configured `CONFIG_RELOAD_INTERVAL` (default: 24h)
- **Without monitors**: Automatically switches to 5 minutes for faster discovery

### Behavior

#### Initial Startup with Zero Monitors
```
[WARN] No monitors configured yet. Agent will retry loading configuration periodically.
[INFO] Starting health server on :8080
```
- Agent starts successfully
- Health endpoint remains active
- Config reload happens every 5 minutes

#### When Monitors Are Added
```
[INFO] Monitors changed. Restarting collector. Monitoring: [1, 2, 3]
```
- Detects new monitors on next reload cycle
- Starts collector with new monitors
- Switches to normal reload interval (24h)

#### When All Monitors Are Removed
```
[INFO] No monitors assigned. Stopping collector.
```
- Stops collector gracefully
- Switches back to 5-minute reload interval
- Continues checking for new monitors

### Configuration

```bash
# Normal reload interval (when monitors exist)
CONFIG_RELOAD_INTERVAL=24h

# Automatic fast reload when no monitors (hardcoded to 5m)
# No configuration needed - happens automatically
```

## Implementation Details

### Both Agents (uptime-o-agent & uptime-o-api-agent)

1. **Conditional Collector Start**
   - Only starts collector if `len(agent.Monitors) > 0`
   - Prevents unnecessary goroutines

2. **Dynamic Ticker Reset**
   - Adjusts reload interval based on monitor count
   - `getReloadInterval()` function returns appropriate interval

3. **Monitor Change Detection**
   - Compares monitor IDs before/after reload
   - Restarts collector only when monitors change
   - Handles both addition and removal of monitors

## Benefits

- **Fast Discovery**: New monitors detected within 5 minutes
- **Resource Efficient**: No unnecessary monitoring when no monitors assigned
- **Automatic Recovery**: Handles monitor assignment/removal dynamically
- **Always Available**: Health endpoint remains active regardless of monitor count
