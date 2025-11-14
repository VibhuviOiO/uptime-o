# Monitor Group and Visibility Feature

## Overview
Implemented two major features:
1. **Monitor Groups**: Ability to create group monitors that can contain child monitors
2. **Monitoring Visibility**: Distinguish between internal (team-only) and external (public status page) monitoring

## Changes Summary

### Backend Changes

#### 1. HttpMonitor Entity (`HttpMonitor.java`)
- Made `url` field nullable (required for group type)
- Added `monitoringVisibility` field (VARCHAR(20), default: 'internal')
- Added `parent` relationship (ManyToOne self-reference)
- Added `children` relationship (OneToMany self-reference)
- Added getters/setters for new fields

#### 2. HttpMonitorDTO (`HttpMonitorDTO.java`)
- Added `monitoringVisibility` field
- Added `parentId` field for parent group reference

#### 3. HttpMonitorMapper (`HttpMonitorMapper.java`)
- Added mapping for `parentId` to `parent.id`
- Added `fromId` method for parent relationship mapping
- Ignored `children` and `removeChild` in toEntity mapping

#### 4. Database Migrations

**20251115150000_add_monitor_group_support.xml**:
- Added `parent_id` column (BIGINT, nullable)
- Added foreign key constraint to self-reference
- Dropped NOT NULL constraint on `url` column

**20251115160000_add_monitoring_visibility.xml**:
- Added `monitoring_visibility` column (VARCHAR(20), default: 'internal')

#### 5. StatusPageResource (`StatusPageResource.java`)
- Added filter to only show monitors with `monitoringVisibility = 'external'` on public status page
- Internal monitors are excluded from public view

### Frontend Changes

#### 1. TypeScript Model (`http-monitor.model.ts`)
- Added `monitoringVisibility` field (default: 'internal')
- Added `parentId` field

#### 2. HttpMonitorEditModal Component
- Added "group" option to Type dropdown
- Hide URL field when type is "group"
- Added "Parent Group" dropdown (only shown for non-group monitors)
- Added "Monitoring Visibility" dropdown with options:
  - Internal (Team Only)
  - External (Public Status Page)
- Hide execution settings, thresholds, advanced settings, headers, and body for group type
- Load group monitors for parent selection
- Updated form validation to skip URL requirement for group type

#### 3. Monitor List View (`http-monitor.tsx`)
- Display "Group Monitor" badge for group type monitors instead of URL

### Test Coverage

#### HttpMonitorGroupIT.java
- `createGroupMonitorWithoutUrl()`: Verify group monitors can be created without URL
- `createChildMonitorWithParent()`: Verify child monitors can reference parent group
- `getGroupMonitorWithChildren()`: Verify group monitor retrieval
- `groupMonitorCanHaveNullUrl()`: Verify null URL is allowed for groups
- `nonGroupMonitorRequiresUrl()`: Verify non-group monitors still require URL
- `monitorVisibilityDefaultsToInternal()`: Verify default visibility is internal
- `externalMonitorVisibleOnStatusPage()`: Verify external visibility setting

## Usage

### Creating a Group Monitor
1. Click "New Monitor"
2. Enter Name
3. Select Type: "group"
4. Select Monitoring Visibility (internal/external)
5. URL field is hidden for groups
6. Execution settings are hidden for groups
7. Save

### Creating a Child Monitor
1. Click "New Monitor"
2. Enter Name, Type (http/http-keyword/http-json), Method, URL
3. Optionally select a Parent Group from dropdown
4. Configure execution settings, thresholds, etc.
5. Select Monitoring Visibility:
   - **Internal**: Only visible to internal team
   - **External**: Visible on public status page for clients
6. Save

### Monitoring Visibility Behavior
- **Internal Monitors**: 
  - Monitored by internal team
  - NOT visible on public status page
  - Use for internal services, staging environments, etc.
  
- **External Monitors**:
  - Visible on public status page
  - Clients can see status and performance
  - Use for client-facing APIs and services

## Database Schema

```sql
-- Monitor Groups
ALTER TABLE api_monitors ADD COLUMN parent_id BIGINT;
ALTER TABLE api_monitors ADD CONSTRAINT fk_api_monitors_parent_id 
    FOREIGN KEY (parent_id) REFERENCES api_monitors(id);
ALTER TABLE api_monitors ALTER COLUMN url DROP NOT NULL;

-- Monitoring Visibility
ALTER TABLE api_monitors ADD COLUMN monitoring_visibility VARCHAR(20) DEFAULT 'internal';
```

## API Changes

### HttpMonitorDTO
```json
{
  "id": 1,
  "name": "Production API Group",
  "type": "group",
  "method": "GET",
  "url": null,
  "parentId": null,
  "monitoringVisibility": "internal",
  "intervalSeconds": 60,
  "timeoutSeconds": 30,
  "retryCount": 2,
  "retryDelaySeconds": 5
}
```

### Child Monitor with Parent
```json
{
  "id": 2,
  "name": "Auth Service",
  "type": "http",
  "method": "GET",
  "url": "https://api.example.com/auth",
  "parentId": 1,
  "monitoringVisibility": "external",
  "intervalSeconds": 60,
  "timeoutSeconds": 30
}
```

## Benefits

### Monitor Groups
- Organize related monitors together
- Hierarchical structure for better management
- Group monitors by service, environment, or team
- Simplified navigation and reporting

### Monitoring Visibility
- **Security**: Keep internal services private
- **Client Transparency**: Show only client-facing services on public page
- **Flexibility**: Same monitoring platform for internal and external services
- **Compliance**: Control what information is publicly visible

## Future Enhancements
- Group-level aggregated status (all children UP = group UP)
- Group-level alerting rules
- Nested groups (multi-level hierarchy)
- Bulk operations on group children
- Group-based permissions and access control
