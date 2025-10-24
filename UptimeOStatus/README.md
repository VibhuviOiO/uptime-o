
# Status Monitoring Dashboard

A generic, configurable status monitoring dashboard for API services.

## Configuration

The application can be customized through environment variables in the backend's `.env` file:

### Environment Variables

Copy `backend/.env.example` to `backend/.env` and update the values:

```env
# Database Configuration
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGDATABASE=your_db_name
PGHOST=localhost
PGPORT=5432

# Application Configuration
NAVBAR_TITLE=Your Company Status
STATUS_PAGE_TITLE=Your Company Health Status
STATUS_PAGE_SUBTITLE=Real-time monitoring dashboard for your services
```

### Configuration Options

- `NAVBAR_TITLE`: The title displayed in the navigation bar
- `STATUS_PAGE_TITLE`: The main heading on the status page
- `STATUS_PAGE_SUBTITLE`: The subtitle under the main heading

If these variables are not set, the application will use default values.

## Status Examples

https://status.openai.com/
https://bitbucket.status.atlassian.com/
https://status.atlassian.com/
https://health.aws.amazon.com/health/status
https://www.githubstatus.com/