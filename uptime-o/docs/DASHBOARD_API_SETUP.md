# Dashboard API Endpoints - Backend Requirements

**Status**: Ready to implement on backend  
**Date**: November 1, 2025

---

## Lightweight Count Endpoints

These endpoints are designed to be **very lightweight** - returning only counts without full entity data.

### 1. Regions Count
```
GET /api/regions/count
Response: { "totalCount": 5 }
Purpose: Get total number of regions
Load: Minimal (single COUNT query)
```

### 2. Datacenters Count
```
GET /api/datacenters/count
Response: { "totalCount": 12 }
Purpose: Get total number of datacenters
Load: Minimal (single COUNT query)
```

### 3. Agents Count
```
GET /api/agents/count
Response: { "totalCount": 28 }
Purpose: Get total number of active agents
Load: Minimal (single COUNT query)
```

### 4. HTTP Monitors Count
```
GET /api/http-monitors/count
Response: { "totalCount": 42 }
Purpose: Get total number of API monitors
Load: Minimal (single COUNT query)
```

### 5. System Health (Existing)
```
GET /admin/jhi-health
Response: { 
  "status": "UP",
  "components": { ... }
}
Purpose: Get system health status
Load: Minimal (existing endpoint)
```

---

## Implementation Notes

### Backend Implementation Example (Java Spring)

For each count endpoint, use simple COUNT queries:

```java
@GetMapping("/count")
public ResponseEntity<Map<String, Long>> getRegionsCount() {
  long totalCount = regionRepository.count();
  return ResponseEntity.ok(Map.of("totalCount", totalCount));
}
```

### Benefits of This Approach

✅ **Zero Stress on Backend**
- Simple COUNT queries only
- No full entity loading
- No N+1 queries

✅ **No Database Stress**
- Single database query per endpoint
- Minimal memory usage
- Can be cached easily

✅ **Lazy Loading**
- Cards load only when visible
- Staggered requests over time
- No thundering herd problem

✅ **Fast Response**
- Minimal data transfer
- <50ms typical response time
- No serialization overhead

---

## Frontend Features

### Lazy Loading Implementation
- Uses **Intersection Observer API**
- Cards load only when scrolled into view
- Each metric loads independently
- 50px margin for early loading

### Error Handling
- 5-second timeout per request
- Shows "Failed to load" on error
- Graceful degradation
- No cascading failures

### Loading States
- Skeleton animation while loading
- Smooth transitions
- Professional UX
- Never blocks interaction

### Debouncing
- 500ms debounce on loads
- Prevents rapid re-requests
- Respects rate limits
- Efficient caching

---

## Caching Recommendations

### Browser Cache
```
Cache-Control: public, max-age=60
// Refresh count every 60 seconds
```

### Backend Cache (Optional)
```
- Cache for 30-60 seconds
- Invalidate on create/update/delete
- Use Redis for distributed caching
```

---

## Monitor Load

### Current Load (With Lazy Loading)
- **Page Load**: 0 requests (cards not visible yet)
- **After Scroll**: ~5 requests (one per visible card)
- **Total**: 5 lightweight count queries
- **Total Data**: ~500 bytes
- **Response Time**: <250ms total
- **Database Hits**: 5 COUNT queries

### Without Lazy Loading (For Comparison)
- **Page Load**: 5-6 requests immediately
- **Database Hits**: 5 COUNT queries immediately
- **Potential Stress**: High if many users load simultaneously

---

## API Contract

### Success Response
```json
{
  "totalCount": 42
}
```

### Error Handling
- **404**: Not found (treat as 0)
- **500**: Server error (show "Failed to load")
- **Timeout**: After 5 seconds
- **Network Error**: Show "Failed to load"

---

## Frontend Hook Usage

```tsx
// In home.tsx
const regionsMetric = useRegionsCount();

// Hook automatically:
// 1. Waits for card to be visible
// 2. Fetches from /api/regions/count
// 3. Transforms response to number
// 4. Handles loading/error states
// 5. Never re-fetches (single load)
```

---

## Scalability

### This approach scales to:
- ✅ Hundreds of concurrent users
- ✅ Thousands of database records
- ✅ Multiple region deployments
- ✅ High-traffic periods

### Because:
- Minimal queries per session
- Independent card loading
- Efficient network usage
- Simple database queries

---

## Next Steps

### Backend Team
1. Create `/api/regions/count` endpoint
2. Create `/api/datacenters/count` endpoint
3. Create `/api/agents/count` endpoint
4. Create `/api/http-monitors/count` endpoint
5. Test with load simulation
6. Add caching if needed

### Frontend Team
1. ✅ Hook already created
2. ✅ Component already created
3. ✅ Home page already integrated
4. Test with real backend endpoints
5. Adjust transform functions if needed

---

## Testing Endpoints

Quick curl test:

```bash
# Test regions count
curl http://localhost:8080/api/regions/count

# Response
{"totalCount": 5}
```

---

**Ready to implement on backend!** 🚀

All frontend code is already in place. Just need the 4 count endpoints.
