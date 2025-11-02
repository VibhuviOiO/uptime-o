# Datacenter-Monitor Assignment Flow

## What Should Happen

### 1. **Save Assignment (Frontend → Backend)**

When user clicks "Save" in the Assign modal for HttpMonitor ID=5:

**Frontend does:**
```javascript
// User selects Datacenter 1, 2, 3 (unchecks Datacenter 4)
for (const datacenterId of toCreate) {  // [1, 2, 3]
  axios.post('/api/datacenter-monitors', {
    monitor: { id: 5 },
    datacenter: { id: datacenterId }
  });
}
```

**Expected POST requests:**
```
POST /api/datacenter-monitors
{
  "monitor": { "id": 5 },
  "datacenter": { "id": 1 }
}

POST /api/datacenter-monitors
{
  "monitor": { "id": 5 },
  "datacenter": { "id": 2 }
}

POST /api/datacenter-monitors
{
  "monitor": { "id": 5 },
  "datacenter": { "id": 3 }
}
```

**What gets created in DB (`datacenter_monitors` table):**
```
id | monitor_id | datacenter_id
---+------------+---------------
42 |     5      |      1
43 |     5      |      2
44 |     5      |      3
```

### 2. **Display Assignments (Backend → Frontend)**

When page loads, frontend fetches assignments:

**Frontend request:**
```
GET /api/datacenter-monitors?size=10000
```

**Backend returns (DatacenterMonitorDTO array):**
```json
[
  {
    "id": 42,
    "monitor": { "id": 5, "name": "Check API Health" },
    "datacenter": { "id": 1, "name": "US-East", "code": "USE" }
  },
  {
    "id": 43,
    "monitor": { "id": 5, "name": "Check API Health" },
    "datacenter": { "id": 2, "name": "US-West", "code": "USW" }
  },
  {
    "id": 44,
    "monitor": { "id": 5, "name": "Check API Health" },
    "datacenter": { "id": 3, "name": "EU-Central", "code": "EUC" }
  }
]
```

**Frontend processes (in http-monitor.tsx):**
```javascript
// Group assignments by monitor ID
const grouped = {};
assignments.forEach((assignment) => {
  const monitorId = assignment.monitor?.id;  // 5
  if (monitorId) {
    if (!grouped[monitorId]) grouped[monitorId] = [];
    if (assignment.datacenter) {
      grouped[monitorId].push(assignment.datacenter);
    }
  }
});

// Result:
// grouped[5] = [
//   { id: 1, name: "US-East", code: "USE" },
//   { id: 2, name: "US-West", code: "USW" },
//   { id: 3, name: "EU-Central", code: "EUC" }
// ]
```

**Display in table:**
```
Monitor: Check API Health | Mapped Datacenters: [US-East] [US-West] [EU-Central]
```

## Verification Checklist

✅ **Correct HTTP Monitor ID?**
- Verify `monitorId` variable has correct value when saving
- Check console.warn logs: "Creating assignment for monitor X datacenter Y"

✅ **POST request includes both IDs?**
- Network tab shows POST body with `monitor: { id: X }` AND `datacenter: { id: Y }`
- NO NULL values

✅ **Backend creates in right table?**
- Query DB: `SELECT * FROM datacenter_monitors WHERE monitor_id = 5`
- Result should show correct datacenter_id values

✅ **Frontend fetches correctly?**
- Network tab shows GET `/api/datacenter-monitors`
- Response includes assignments with both `monitor` and `datacenter` objects

✅ **Grouping works?**
- Console.warn shows correct grouping by monitorId
- Badges display correct datacenter names

## Debugging Commands

**Check assignments in DB:**
```sql
SELECT dm.id, dm.monitor_id, dm.datacenter_id, dc.name, hm.name as monitor_name
FROM datacenter_monitors dm
LEFT JOIN datacenters dc ON dm.datacenter_id = dc.id
LEFT JOIN http_monitors hm ON dm.monitor_id = hm.id
ORDER BY dm.monitor_id;
```

**Watch browser console for:**
```
Current assignments: [1, 2, 3]
Selected datacenters: Set(3) { 1, 2, 3 }
To delete: []
To create: []
```

**Network tab check:**
- POST requests should have status 201 (Created)
- Response should include the new assignment ID
