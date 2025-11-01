# Bug Fix: Repository Query Error

## Issue
When starting the Spring Boot application, the following error occurred:

```
org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'dashboardService': 
Unsatisfied dependency expressed through field 'heartbeatRepository': 
No property 'datacenter' found for type 'HttpHeartbeat'
```

## Root Cause
The `HttpHeartbeatRepository` had a query method that tried to reference a non-existent `datacenter` property on `HttpHeartbeat`:

```java
List<HttpHeartbeat> findByDatacenterAndExecutedAtAfter(Datacenter datacenter, Instant from);
```

The issue is that `HttpHeartbeat` doesn't have a direct `datacenter` field. Instead:
- `HttpHeartbeat` has a `@ManyToOne` relationship to `Agent`
- `Agent` has a `@ManyToOne` relationship to `Datacenter`
- Therefore, the datacenter must be accessed via: `agent.datacenter`

## Solution
Changed the query method to use a custom `@Query` annotation to properly traverse the relationship:

```java
@Query("SELECT h FROM HttpHeartbeat h WHERE h.agent.datacenter = :datacenter AND h.executedAt >= :from")
List<HttpHeartbeat> findByDatacenterAndExecutedAtAfter(Datacenter datacenter, Instant from);
```

## Changes Made
**File**: `src/main/java/uptime/observability/repository/HttpHeartbeatRepository.java`

Changed from:
```java
List<HttpHeartbeat> findByDatacenterAndExecutedAtAfter(Datacenter datacenter, Instant from);
```

Changed to:
```java
@Query("SELECT h FROM HttpHeartbeat h WHERE h.agent.datacenter = :datacenter AND h.executedAt >= :from")
List<HttpHeartbeat> findByDatacenterAndExecutedAtAfter(Datacenter datacenter, Instant from);
```

## Verification
✅ **Build Status**: `mvn clean compile` - BUILD SUCCESS
✅ **Application Started**: Backend is running on http://localhost:8080
✅ **Health Check**: `curl http://localhost:8080/management/health` returns `{"status":"UP"...}`
✅ **Error Fixed**: No more "No property 'datacenter' found" errors

## Impact
This fix resolves the startup error and allows the DashboardService to properly query heartbeats filtered by datacenter, which is essential for Phase 1.1's dashboard metrics aggregation functionality.

---

**Status**: ✅ FIXED & VERIFIED
**Application**: Running successfully
**Next**: Frontend can now integrate with the dashboard APIs
