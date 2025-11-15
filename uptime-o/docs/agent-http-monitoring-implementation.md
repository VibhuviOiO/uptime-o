# Agent HTTP Monitoring Implementation Guide

## Overview
This guide explains how agents should implement HTTP monitoring to collect and submit heartbeat data to the UptimeO platform. Agents execute HTTP requests based on monitor configurations and report detailed metrics.

## Monitor Configuration Retrieval

### Endpoint
```
GET /api/agent-monitors?agentId={agentId}
```

### Response Structure
```json
{
  "id": 1,
  "agentId": 1001,
  "monitorId": 5001,
  "enabled": true,
  "monitor": {
    "id": 5001,
    "name": "Production API",
    "method": "GET",
    "type": "http",
    "url": "https://api.example.com/health",
    "headers": {
      "Authorization": "Bearer token123",
      "User-Agent": "UptimeO-Agent/1.0"
    },
    "body": {
      "key": "value"
    },
    "intervalSeconds": 60,
    "timeoutSeconds": 30,
    "retryCount": 2,
    "retryDelaySeconds": 5,
    "checkSslCertificate": true,
    "checkDnsResolution": true,
    "ignoreTlsError": false,
    "maxRedirects": 10
  }
}
```

## HTTP Request Execution

### Supported HTTP Methods
- GET
- POST
- PUT
- DELETE
- PATCH
- HEAD
- OPTIONS

### Request Headers
1. **User-Provided Headers**: Include all headers from `monitor.headers` (JSONB)
2. **Content-Type**: Set to `application/json` if `monitor.body` is present
3. **User-Agent**: Add agent identifier if not already present

### Request Body
- Include `monitor.body` (JSONB) for POST, PUT, PATCH methods
- Serialize as JSON string
- Skip body for GET, HEAD, DELETE, OPTIONS methods

### Timeout & Retries
- **Timeout**: Use `monitor.timeoutSeconds` for request timeout
- **Retry Count**: Retry failed requests `monitor.retryCount` times
- **Retry Delay**: Wait `monitor.retryDelaySeconds` between retries

### SSL/TLS Handling
- **Ignore TLS Errors**: If `monitor.ignoreTlsError` is true, skip certificate validation
- **Collect Certificate Info**: Always collect SSL certificate data (even when ignoring errors)

### Redirects
- **Max Redirects**: Follow up to `monitor.maxRedirects` redirects
- **Redirect Tracking**: Count total redirects in the chain

## Metrics Collection

### Timing Metrics (Required)
Collect detailed timing breakdown for each request:

```go
type TimingMetrics struct {
    DNSLookupMs       int  // DNS resolution time
    TCPConnectMs      int  // TCP connection establishment
    TLSHandshakeMs    int  // TLS/SSL handshake time
    TimeToFirstByteMs int  // Time until first response byte
    ResponseTimeMs    int  // Total end-to-end time
}
```

### DNS Resolution (if checkDnsResolution = true)
```go
type DNSMetrics struct {
    ResolvedIP string // First resolved IP address
}
```

### SSL Certificate (if checkSslCertificate = true)
```go
type SSLMetrics struct {
    CertificateValid    bool      // Certificate validation status
    CertificateExpiry   time.Time // Certificate expiration date
    CertificateIssuer   string    // Certificate issuer (max 500 chars)
    DaysUntilExpiry     int       // Days until certificate expires
}
```

**Certificate Validation Logic:**
```go
func validateCertificate(cert *x509.Certificate) SSLMetrics {
    now := time.Now()
    expiry := cert.NotAfter
    daysUntil := int(expiry.Sub(now).Hours() / 24)
    
    return SSLMetrics{
        CertificateValid:  now.Before(expiry),
        CertificateExpiry: expiry,
        CertificateIssuer: cert.Issuer.String(),
        DaysUntilExpiry:   daysUntil,
    }
}
```

### Response Metrics
```go
type ResponseMetrics struct {
    StatusCode      int    // HTTP status code
    SizeBytes       int    // Response body size
    ContentType     string // Content-Type header (max 50 chars)
    Server          string // Server header (max 50 chars)
    CacheStatus     string // Cache status header (max 50 chars)
}
```

### Error Handling
```go
type ErrorInfo struct {
    ErrorType    string // Error classification (max 50 chars)
    ErrorMessage string // Detailed error message (text)
}
```

**Error Types:**
- `TIMEOUT` - Request timeout
- `DNS_ERROR` - DNS resolution failed
- `CONNECTION_ERROR` - TCP connection failed
- `TLS_ERROR` - SSL/TLS handshake failed
- `HTTP_ERROR` - HTTP protocol error
- `NETWORK_ERROR` - Network connectivity issue
- `UNKNOWN_ERROR` - Unclassified error

## Heartbeat Submission

### Endpoint
```
POST /api/http-heartbeats
```

### Authentication
Include agent API key in header:
```
X-API-Key: uptimeo_your_agent_api_key
```

### Request Body Structure
```json
{
  "monitorId": 5001,
  "agentId": 1001,
  "executedAt": "2025-01-16T10:30:00Z",
  "success": true,
  "responseTimeMs": 245,
  "responseSizeBytes": 1024,
  "responseStatusCode": 200,
  "responseContentType": "application/json",
  "responseServer": "nginx/1.21.0",
  "responseCacheStatus": "HIT",
  "dnsLookupMs": 12,
  "dnsResolvedIp": "192.168.1.100",
  "tcpConnectMs": 45,
  "tlsHandshakeMs": 78,
  "sslCertificateValid": true,
  "sslCertificateExpiry": "2025-12-31T23:59:59Z",
  "sslCertificateIssuer": "CN=Let's Encrypt Authority X3,O=Let's Encrypt,C=US",
  "sslDaysUntilExpiry": 350,
  "timeToFirstByteMs": 110,
  "errorType": null,
  "errorMessage": null,
  "rawRequestHeaders": {
    "Authorization": "Bearer token123",
    "User-Agent": "UptimeO-Agent/1.0",
    "Content-Type": "application/json"
  },
  "rawResponseHeaders": {
    "Content-Type": "application/json",
    "Server": "nginx/1.21.0",
    "Cache-Control": "max-age=3600"
  },
  "rawResponseBody": {
    "status": "healthy",
    "version": "1.2.3"
  }
}
```

### Field Requirements

**Required Fields:**
- `monitorId` (Long)
- `agentId` (Long)
- `executedAt` (ISO 8601 timestamp)
- `success` (Boolean)

**Optional Fields (populate when available):**
- `responseTimeMs` (Integer)
- `responseSizeBytes` (Integer)
- `responseStatusCode` (Integer)
- `responseContentType` (String, max 50)
- `responseServer` (String, max 50)
- `responseCacheStatus` (String, max 50)
- `dnsLookupMs` (Integer)
- `dnsResolvedIp` (String, max 100)
- `tcpConnectMs` (Integer)
- `tlsHandshakeMs` (Integer)
- `sslCertificateValid` (Boolean)
- `sslCertificateExpiry` (ISO 8601 timestamp)
- `sslCertificateIssuer` (String, max 500)
- `sslDaysUntilExpiry` (Integer)
- `timeToFirstByteMs` (Integer)
- `errorType` (String, max 50)
- `errorMessage` (String, text)
- `rawRequestHeaders` (JSON object)
- `rawResponseHeaders` (JSON object)
- `rawResponseBody` (JSON object)

## Implementation Examples

### Example 1: Successful GET Request
```json
{
  "monitorId": 5001,
  "agentId": 1001,
  "executedAt": "2025-01-16T10:30:00Z",
  "success": true,
  "responseTimeMs": 245,
  "responseSizeBytes": 512,
  "responseStatusCode": 200,
  "responseContentType": "application/json",
  "dnsLookupMs": 12,
  "dnsResolvedIp": "93.184.216.34",
  "tcpConnectMs": 45,
  "tlsHandshakeMs": 78,
  "sslCertificateValid": true,
  "sslCertificateExpiry": "2025-12-31T23:59:59Z",
  "sslCertificateIssuer": "CN=Let's Encrypt Authority X3",
  "sslDaysUntilExpiry": 350,
  "timeToFirstByteMs": 110,
  "rawRequestHeaders": {
    "User-Agent": "UptimeO-Agent/1.0"
  },
  "rawResponseHeaders": {
    "Content-Type": "application/json",
    "Content-Length": "512"
  },
  "rawResponseBody": {
    "status": "ok"
  }
}
```

### Example 2: Failed Request (Timeout)
```json
{
  "monitorId": 5002,
  "agentId": 1001,
  "executedAt": "2025-01-16T10:31:00Z",
  "success": false,
  "responseTimeMs": 30000,
  "errorType": "TIMEOUT",
  "errorMessage": "Request timeout after 30 seconds",
  "dnsLookupMs": 15,
  "dnsResolvedIp": "192.168.1.50",
  "tcpConnectMs": 5000,
  "rawRequestHeaders": {
    "User-Agent": "UptimeO-Agent/1.0"
  }
}
```

### Example 3: SSL Certificate Expiring Soon
```json
{
  "monitorId": 5003,
  "agentId": 1001,
  "executedAt": "2025-01-16T10:32:00Z",
  "success": true,
  "responseTimeMs": 180,
  "responseStatusCode": 200,
  "dnsLookupMs": 10,
  "dnsResolvedIp": "104.26.10.123",
  "tcpConnectMs": 40,
  "tlsHandshakeMs": 65,
  "sslCertificateValid": true,
  "sslCertificateExpiry": "2025-02-10T23:59:59Z",
  "sslCertificateIssuer": "CN=DigiCert SHA2 Secure Server CA",
  "sslDaysUntilExpiry": 25,
  "timeToFirstByteMs": 95,
  "rawResponseHeaders": {
    "Content-Type": "text/html"
  }
}
```

### Example 4: POST Request with Body
```json
{
  "monitorId": 5004,
  "agentId": 1001,
  "executedAt": "2025-01-16T10:33:00Z",
  "success": true,
  "responseTimeMs": 320,
  "responseSizeBytes": 256,
  "responseStatusCode": 201,
  "responseContentType": "application/json",
  "dnsLookupMs": 8,
  "dnsResolvedIp": "172.217.14.206",
  "tcpConnectMs": 35,
  "tlsHandshakeMs": 70,
  "timeToFirstByteMs": 150,
  "rawRequestHeaders": {
    "Content-Type": "application/json",
    "Authorization": "Bearer token123"
  },
  "rawResponseHeaders": {
    "Content-Type": "application/json",
    "Location": "/api/users/12345"
  },
  "rawResponseBody": {
    "id": 12345,
    "created": true
  }
}
```

### Example 5: HEAD Request (No Body)
```json
{
  "monitorId": 5005,
  "agentId": 1001,
  "executedAt": "2025-01-16T10:34:00Z",
  "success": true,
  "responseTimeMs": 85,
  "responseSizeBytes": 0,
  "responseStatusCode": 200,
  "responseContentType": "text/html",
  "dnsLookupMs": 5,
  "dnsResolvedIp": "151.101.1.195",
  "tcpConnectMs": 25,
  "tlsHandshakeMs": 40,
  "timeToFirstByteMs": 15,
  "rawRequestHeaders": {
    "User-Agent": "UptimeO-Agent/1.0"
  },
  "rawResponseHeaders": {
    "Content-Type": "text/html",
    "Content-Length": "15234",
    "Last-Modified": "Wed, 15 Jan 2025 12:00:00 GMT"
  }
}
```

### Example 6: Self-Signed Certificate (Ignore TLS Error)
```json
{
  "monitorId": 5006,
  "agentId": 1001,
  "executedAt": "2025-01-16T10:35:00Z",
  "success": true,
  "responseTimeMs": 150,
  "responseStatusCode": 200,
  "dnsLookupMs": 10,
  "dnsResolvedIp": "10.0.1.50",
  "tcpConnectMs": 30,
  "tlsHandshakeMs": 55,
  "sslCertificateValid": false,
  "sslCertificateExpiry": "2026-01-01T00:00:00Z",
  "sslCertificateIssuer": "CN=Self-Signed Certificate",
  "sslDaysUntilExpiry": 350,
  "timeToFirstByteMs": 65,
  "rawResponseHeaders": {
    "Content-Type": "application/json"
  }
}
```

## Best Practices

### 1. Timing Accuracy
- Use high-resolution timers for accurate millisecond measurements
- Measure each phase separately (DNS, TCP, TLS, TTFB)
- Total response time should equal sum of all phases

### 2. Error Handling
- Always set `success: false` on any error
- Populate `errorType` and `errorMessage` with details
- Include partial metrics even on failure (e.g., DNS time before timeout)

### 3. SSL Certificate Collection
- Collect certificate info even when `ignoreTlsError: true`
- Calculate days until expiry accurately
- Truncate issuer string to 500 characters if needed

### 4. DNS Resolution
- Only perform DNS lookup if `checkDnsResolution: true`
- Cache DNS results per execution interval
- Report first resolved IP address

### 5. Response Body Handling
- Parse JSON responses when Content-Type is `application/json`
- Store raw response body as JSON object (not string)
- Limit response body size to prevent memory issues

### 6. Header Storage
- Store request and response headers as JSON objects
- Preserve header case as received
- Include all headers (don't filter)

### 7. Retry Logic
```go
func executeWithRetry(monitor Monitor) Heartbeat {
    var lastError error
    
    for attempt := 0; attempt <= monitor.RetryCount; attempt++ {
        heartbeat, err := executeRequest(monitor)
        
        if err == nil && heartbeat.Success {
            return heartbeat
        }
        
        lastError = err
        
        if attempt < monitor.RetryCount {
            time.Sleep(time.Duration(monitor.RetryDelaySeconds) * time.Second)
        }
    }
    
    // Return last failed attempt
    return createFailedHeartbeat(monitor, lastError)
}
```

### 8. Concurrent Execution
- Execute monitors concurrently (goroutines/threads)
- Respect monitor intervals independently
- Queue heartbeats for batch submission

### 9. Offline Queue
- Queue heartbeats locally if API is unreachable
- Retry submission with exponential backoff
- Limit queue size to prevent memory exhaustion

### 10. Logging
- Log each monitor execution (start/end)
- Log errors with full context
- Log SSL certificate warnings (expiring soon)

## Validation Checklist

Before submitting heartbeat data, verify:

- ✅ `monitorId` and `agentId` are valid
- ✅ `executedAt` is in ISO 8601 format with timezone
- ✅ `success` reflects actual request outcome
- ✅ Timing metrics are non-negative integers
- ✅ String fields respect max length constraints
- ✅ JSON fields are valid JSON objects (not strings)
- ✅ SSL certificate data is present for HTTPS URLs
- ✅ DNS resolution data is present when enabled
- ✅ Error fields are populated on failure

## Troubleshooting

### Issue: Heartbeats Not Appearing in UI
- Verify API key is correct
- Check heartbeat submission endpoint response
- Ensure `monitorId` and `agentId` exist in database
- Validate JSON structure matches schema

### Issue: Timing Metrics Incorrect
- Use monotonic clock for measurements
- Measure each phase independently
- Verify timer resolution (milliseconds)

### Issue: SSL Certificate Not Collected
- Ensure HTTPS URL (not HTTP)
- Check if `checkSslCertificate` is true
- Verify TLS connection is established

### Issue: DNS Resolution Failing
- Check network connectivity
- Verify DNS server configuration
- Test DNS resolution independently

## API Response Codes

- `201 Created` - Heartbeat successfully created
- `400 Bad Request` - Invalid request body or missing required fields
- `401 Unauthorized` - Invalid or missing API key
- `404 Not Found` - Monitor or agent not found
- `500 Internal Server Error` - Server error

## Rate Limiting

- No explicit rate limits on heartbeat submission
- Respect monitor intervals (don't submit faster than configured)
- Batch submissions recommended for efficiency
