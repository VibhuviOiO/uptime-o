

# HTTP Monitor Authentication Guide

## Overview
UptimeO supports various authentication methods for HTTP monitoring through the `headers` field. This guide shows how to configure different authentication types.

## Authentication Methods

### 1. No Authentication
For public endpoints that don't require authentication.

```json
{
  "name": "Public API",
  "url": "https://api.example.com/public/health",
  "method": "GET",
  "headers": {}
}
```

### 2. Basic Authentication
HTTP Basic Auth sends credentials as base64-encoded `username:password`.

#### Manual Configuration
```json
{
  "name": "Protected API",
  "url": "https://api.example.com/protected",
  "method": "GET",
  "headers": {
    "Authorization": "Basic dXNlcm5hbWU6cGFzc3dvcmQ="
  }
}
```

#### Generate Base64 Token
```bash
# Linux/macOS
echo -n "username:password" | base64

# Output: dXNlcm5hbWU6cGFzc3dvcmQ=
```

```powershell
# Windows PowerShell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("username:password"))
```

#### Example
```json
{
  "name": "Admin API",
  "url": "https://api.example.com/admin/status",
  "method": "GET",
  "headers": {
    "Authorization": "Basic YWRtaW46c2VjcmV0MTIz"
  }
}
```

### 3. Bearer Token Authentication
Used for OAuth2, JWT, and other token-based authentication.

```json
{
  "name": "OAuth2 Protected API",
  "url": "https://api.example.com/v1/users",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Common Use Cases
- **JWT Tokens**: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **OAuth2 Access Tokens**: `Bearer ya29.a0AfH6SMBx...`
- **Personal Access Tokens**: `Bearer ghp_1234567890abcdef...`

### 4. API Key Authentication

#### Header-Based API Key
```json
{
  "name": "API with Key in Header",
  "url": "https://api.example.com/data",
  "method": "GET",
  "headers": {
    "X-API-Key": "your-api-key-here",
    "X-API-Secret": "your-api-secret-here"
  }
}
```

#### Common API Key Header Names
- `X-API-Key`
- `X-API-Token`
- `X-Auth-Token`
- `apikey`
- `api-key`

#### Query Parameter API Key
For APIs that require API key in URL:
```json
{
  "name": "API with Key in URL",
  "url": "https://api.example.com/data?api_key=your-api-key-here",
  "method": "GET",
  "headers": {}
}
```

### 5. Custom Authentication Headers
Some APIs use custom authentication schemes.

#### Example: AWS Signature
```json
{
  "name": "AWS API",
  "url": "https://service.region.amazonaws.com/endpoint",
  "method": "GET",
  "headers": {
    "Authorization": "AWS4-HMAC-SHA256 Credential=...",
    "X-Amz-Date": "20240115T120000Z",
    "X-Amz-Content-Sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
}
```

#### Example: Digest Authentication
```json
{
  "name": "Digest Auth API",
  "url": "https://api.example.com/resource",
  "method": "GET",
  "headers": {
    "Authorization": "Digest username=\"user\", realm=\"api\", nonce=\"dcd98b7102dd2f0e8b11d0f600bfb0c093\", uri=\"/resource\", response=\"6629fae49393a05397450978507c4ef1\""
  }
}
```

### 6. Multiple Headers
Combine multiple authentication headers when needed.

```json
{
  "name": "Multi-Auth API",
  "url": "https://api.example.com/secure",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer your-token-here",
    "X-API-Key": "your-api-key",
    "X-Client-ID": "your-client-id",
    "X-Request-ID": "unique-request-id"
  },
  "body": {
    "action": "check_status"
  }
}
```

### 7. Cookie-Based Authentication
For session-based authentication.

```json
{
  "name": "Session API",
  "url": "https://app.example.com/api/status",
  "method": "GET",
  "headers": {
    "Cookie": "sessionid=abc123xyz; csrftoken=def456uvw"
  }
}
```

## Authentication with Different HTTP Methods

### GET with Authentication
```json
{
  "name": "GET with Auth",
  "url": "https://api.example.com/users",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer token123"
  }
}
```

### POST with Authentication
```json
{
  "name": "POST with Auth",
  "url": "https://api.example.com/users",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer token123",
    "Content-Type": "application/json"
  },
  "body": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### PUT with Authentication
```json
{
  "name": "PUT with Auth",
  "url": "https://api.example.com/users/123",
  "method": "PUT",
  "headers": {
    "Authorization": "Basic dXNlcjpwYXNz",
    "Content-Type": "application/json"
  },
  "body": {
    "name": "Jane Doe"
  }
}
```

### DELETE with Authentication
```json
{
  "name": "DELETE with Auth",
  "url": "https://api.example.com/users/123",
  "method": "DELETE",
  "headers": {
    "Authorization": "Bearer token123"
  }
}
```

## Real-World Examples

### GitHub API
```json
{
  "name": "GitHub API",
  "url": "https://api.github.com/user",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer ghp_your_personal_access_token",
    "Accept": "application/vnd.github.v3+json"
  }
}
```

### Stripe API
```json
{
  "name": "Stripe API",
  "url": "https://api.stripe.com/v1/charges",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer sk_test_your_secret_key"
  }
}
```

### Slack Webhook
```json
{
  "name": "Slack Webhook",
  "url": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "text": "Health check from UptimeO"
  }
}
```

### AWS API Gateway
```json
{
  "name": "AWS API Gateway",
  "url": "https://api-id.execute-api.region.amazonaws.com/prod/endpoint",
  "method": "GET",
  "headers": {
    "x-api-key": "your-api-gateway-key"
  }
}
```

### Google Cloud API
```json
{
  "name": "Google Cloud API",
  "url": "https://cloudresourcemanager.googleapis.com/v1/projects",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer ya29.your_access_token"
  }
}
```

## Security Best Practices

### 1. Use HTTPS
Always use HTTPS URLs to encrypt authentication credentials in transit.

```json
✅ "url": "https://api.example.com/secure"
❌ "url": "http://api.example.com/secure"
```

### 2. Rotate Credentials Regularly
Update API keys, tokens, and passwords periodically.

### 3. Use Least Privilege
Grant only necessary permissions to API keys and tokens.

### 4. Monitor for Unauthorized Access
Check heartbeat logs for authentication failures:
- Status code 401 (Unauthorized)
- Status code 403 (Forbidden)

### 5. Avoid Hardcoding Secrets
Consider using environment variables or secret management systems for production deployments.

## Troubleshooting

### 401 Unauthorized
**Cause**: Invalid or missing credentials
**Solution**: 
- Verify token/key is correct
- Check if token has expired
- Ensure Authorization header format is correct

### 403 Forbidden
**Cause**: Valid credentials but insufficient permissions
**Solution**:
- Check API key/token permissions
- Verify endpoint access rights
- Review API documentation for required scopes

### 400 Bad Request
**Cause**: Malformed authentication header
**Solution**:
- Verify header format matches API requirements
- Check for typos in header names
- Ensure proper base64 encoding for Basic Auth

### Token Expiration
**Cause**: OAuth2/JWT tokens expire
**Solution**:
- Implement token refresh mechanism
- Update monitor with new token before expiration
- Consider using long-lived API keys for monitoring

## Advanced Patterns

### Conditional Authentication
Monitor different endpoints with different auth:

```json
// Public health check
{
  "name": "Public Health",
  "url": "https://api.example.com/health",
  "method": "GET",
  "headers": {}
}

// Authenticated endpoint
{
  "name": "Protected Health",
  "url": "https://api.example.com/admin/health",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer token123"
  }
}
```

### Multi-Region Authentication
Same API, different regions with different keys:

```json
// US Region
{
  "name": "API - US",
  "url": "https://us.api.example.com/status",
  "headers": {
    "X-API-Key": "us-region-key"
  }
}

// EU Region
{
  "name": "API - EU",
  "url": "https://eu.api.example.com/status",
  "headers": {
    "X-API-Key": "eu-region-key"
  }
}
```

## Future Enhancements

Phase 2.5 will introduce structured authentication configuration:
- UI helpers for auth configuration
- Automatic Basic Auth encoding
- Encrypted credential storage
- OAuth2 client credentials flow
- Auth testing before saving

Until then, use the `headers` field for all authentication needs.
