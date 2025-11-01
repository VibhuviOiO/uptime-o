# Manual API Testing

This folder contains comprehensive manual testing documentation for the UptimeO application APIs.

## Files

### HttpMonitoring.md
Complete testing guide for HTTP Monitoring APIs including:
- Authentication flow (Login → JWT Token)
- Full CRUD operations (Create, Read, Update, Delete, List)
- JSONB field handling validation
- Real execution results with timestamps
- Error handling verification

## Testing Workflow

1. **Authentication**: Login with admin credentials to obtain JWT token
2. **Create**: POST new HTTP monitor with JSON data
3. **Read**: GET individual monitor by ID
4. **Update**: PUT modified monitor with headers/body JSON
5. **List**: GET all monitors in collection
6. **Delete**: DELETE monitor by ID
7. **Verify**: Confirm deletion with 404 response

## Key Features Tested

- ✅ JWT Authentication
- ✅ JSONB field serialization/deserialization
- ✅ CRUD operations
- ✅ Error handling (404, validation)
- ✅ Database persistence
- ✅ REST API compliance

## Usage

1. Start the application: `./mvnw spring-boot:run`
2. Follow the step-by-step guide in `HttpMonitoring.md`
3. Execute each curl command in sequence
4. Verify responses match expected results

## Notes

- All commands use real JWT tokens (refreshed during testing)
- JSONB fields properly handle complex nested objects
- PostgreSQL JSONB column compatibility verified
- All operations tested with actual database persistence