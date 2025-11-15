# Agent Implementation: SSL Certificate Monitoring

## Overview
Agent must collect SSL certificate information during HTTPS requests and send it in heartbeat responses.

## Monitor Configuration Fields (Read from API)

```json
{
  "checkSslCertificate": true,
  "certificateExpiryDays": 30,
  "ignoreTlsError": false
}
```

## Heartbeat Response Fields (Send to API)

### Required SSL Fields
```json
{
  "dnsResolvedIp": "192.168.1.100",
  "sslCertificateValid": true,
  "sslCertificateExpiry": "2025-12-31T23:59:59Z",
  "sslCertificateIssuer": "Let's Encrypt Authority X3",
  "sslDaysUntilExpiry": 348
}
```

## Implementation Logic

### 1. Check if SSL Monitoring is Enabled
```go
if monitor.CheckSslCertificate && strings.HasPrefix(monitor.URL, "https://") {
    // Collect SSL certificate data
}
```

### 2. Extract Certificate from TLS Connection
```go
// During HTTPS request
tlsConn := httpResponse.TLS
if tlsConn != nil && len(tlsConn.PeerCertificates) > 0 {
    cert := tlsConn.PeerCertificates[0]
    
    // Validate certificate
    heartbeat.SslCertificateValid = validateCertificate(cert, monitor.IgnoreTlsError)
    
    // Extract expiry
    heartbeat.SslCertificateExpiry = cert.NotAfter.Format(time.RFC3339)
    
    // Calculate days until expiry
    daysUntilExpiry := int(time.Until(cert.NotAfter).Hours() / 24)
    heartbeat.SslDaysUntilExpiry = &daysUntilExpiry
    
    // Extract issuer
    issuer := cert.Issuer.CommonName
    if issuer == "" {
        issuer = cert.Issuer.Organization[0]
    }
    heartbeat.SslCertificateIssuer = &issuer
}
```

### 3. Certificate Validation Logic
```go
func validateCertificate(cert *x509.Certificate, ignoreTlsError bool) bool {
    now := time.Now()
    
    // Check expiry
    if now.After(cert.NotAfter) {
        return false // Expired
    }
    
    // Check not yet valid
    if now.Before(cert.NotBefore) {
        return false // Not yet valid
    }
    
    // If ignoreTlsError is true, skip other validations
    if ignoreTlsError {
        return true
    }
    
    // Perform full validation (hostname, chain, etc.)
    // Return false if any validation fails
    return true
}
```

### 4. DNS Resolution Tracking
```go
// Extract resolved IP from connection
if conn != nil {
    remoteAddr := conn.RemoteAddr().String()
    // Extract IP from "ip:port" format
    ip := strings.Split(remoteAddr, ":")[0]
    heartbeat.DnsResolvedIp = &ip
}
```

## Field Mapping

| Monitor Field | Type | Purpose |
|--------------|------|---------|
| checkSslCertificate | Boolean | Enable SSL certificate collection |
| certificateExpiryDays | Integer | Warning threshold (not used by agent) |
| ignoreTlsError | Boolean | Skip strict SSL validation |

| Heartbeat Field | Type | Required | Source |
|----------------|------|----------|--------|
| dnsResolvedIp | String | No | Connection remote address |
| sslCertificateValid | Boolean | No | Certificate validation result |
| sslCertificateExpiry | String (ISO 8601) | No | cert.NotAfter |
| sslCertificateIssuer | String | No | cert.Issuer.CommonName |
| sslDaysUntilExpiry | Integer | No | Calculated from NotAfter |

## Error Handling

### SSL Certificate Not Available
- Set all SSL fields to `null`
- Continue with request execution

### Certificate Validation Fails
- Set `sslCertificateValid` to `false`
- Still populate other SSL fields
- If `ignoreTlsError` is `false`, fail the request

### DNS Resolution Fails
- Set `dnsResolvedIp` to `null`
- Set `success` to `false`
- Set `errorType` to "DNS_RESOLUTION_ERROR"

## Example Heartbeat Payload

```json
{
  "monitorId": 123,
  "executedAt": "2025-01-17T10:30:00Z",
  "success": true,
  "responseTimeMs": 245,
  "responseStatusCode": 200,
  "dnsLookupMs": 12,
  "dnsResolvedIp": "192.168.1.100",
  "tcpConnectMs": 45,
  "tlsHandshakeMs": 78,
  "sslCertificateValid": true,
  "sslCertificateExpiry": "2025-12-31T23:59:59Z",
  "sslCertificateIssuer": "Let's Encrypt Authority X3",
  "sslDaysUntilExpiry": 348,
  "timeToFirstByteMs": 110
}
```

## Testing Checklist

- [ ] HTTPS monitor with valid certificate - All SSL fields populated
- [ ] HTTPS monitor with expired certificate - `sslCertificateValid` = false
- [ ] HTTPS monitor with self-signed cert + `ignoreTlsError=true` - Request succeeds, cert marked invalid
- [ ] HTTPS monitor with self-signed cert + `ignoreTlsError=false` - Request fails
- [ ] HTTP monitor (no SSL) - SSL fields are null
- [ ] Monitor with `checkSslCertificate=false` - SSL fields are null
- [ ] Certificate expiring in < 30 days - `sslDaysUntilExpiry` calculated correctly
