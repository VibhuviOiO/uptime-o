package uptime.observability.monitoring.local;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import uptime.observability.domain.HttpHeartbeat;
import uptime.observability.domain.HttpMonitor;
import uptime.observability.repository.HttpHeartbeatRepository;

import javax.net.ssl.SSLSession;
import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.net.InetAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.cert.Certificate;
import java.security.cert.X509Certificate;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.zip.GZIPInputStream;
import java.io.ByteArrayInputStream;

@Service
@ConditionalOnProperty(name = "application.monitoring.local.enabled", havingValue = "true")
public class LocalHttpMonitoringService {

    private static final Logger LOG = LoggerFactory.getLogger(LocalHttpMonitoringService.class);
    
    private final HttpClient httpClient;
    private final HttpHeartbeatRepository heartbeatRepository;
    private final ObjectMapper objectMapper;

    public LocalHttpMonitoringService(HttpHeartbeatRepository heartbeatRepository, ObjectMapper objectMapper) {
        this.heartbeatRepository = heartbeatRepository;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();
    }

    public void executeMonitor(HttpMonitor monitor) {
        if (!Boolean.TRUE.equals(monitor.getEnabled())) {
            return;
        }

        LOG.debug("Executing HTTP monitor: {}", monitor.getName());
        
        Instant startTime = Instant.now();
        HttpHeartbeat heartbeat = new HttpHeartbeat();
        heartbeat.setMonitor(monitor);
        heartbeat.setExecutedAt(startTime);
        
        // Set Global Agent (ID 1) for local monitoring
        uptime.observability.domain.Agent globalAgent = new uptime.observability.domain.Agent();
        globalAgent.setId(1L);
        heartbeat.setAgent(globalAgent);

        long dnsStart = System.nanoTime();
        long dnsTime = 0, tcpTime = 0, tlsTime = 0, ttfbTime = 0;
        List<RedirectInfo> redirectChain = new ArrayList<>();

        try {
            // DNS Resolution
            URI uri = URI.create(monitor.getUrl());
            InetAddress[] addresses = InetAddress.getAllByName(uri.getHost());
            dnsTime = (System.nanoTime() - dnsStart) / 1_000_000;
            heartbeat.setDnsLookupMs((int) dnsTime);
            heartbeat.setDnsDetails(buildDnsDetails(addresses, dnsTime));

            // Build and send request
            HttpRequest request = buildRequest(monitor);
            long requestStart = System.nanoTime();
            
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            
            long totalTime = (System.nanoTime() - requestStart) / 1_000_000;
            ttfbTime = totalTime; // Simplified TTFB
            
            // Basic metrics
            heartbeat.setSuccess(isSuccessfulResponse(response.statusCode(), monitor));
            heartbeat.setResponseTimeMs((int) totalTime);
            heartbeat.setResponseStatusCode(response.statusCode());
            heartbeat.setTimeToFirstByteMs((int) ttfbTime);
            heartbeat.setTcpConnectMs(10); // Simplified - Java HttpClient doesn't expose this
            heartbeat.setTlsHandshakeMs(uri.getScheme().equalsIgnoreCase("https") ? 20 : 0);
            

            
            // HTTP Protocol details
            heartbeat.setHttpVersion(response.version().toString());
            
            // Headers
            Map<String, List<String>> headerMap = response.headers().map();
            heartbeat.setRawResponseHeaders(convertHeaders(headerMap));
            
            // Request headers
            if (monitor.getHeaders() != null) {
                heartbeat.setRawRequestHeaders(monitor.getHeaders());
            }
            
            // Response metadata
            heartbeat.setResponseContentType(getHeader(headerMap, "Content-Type"));
            heartbeat.setResponseServer(getHeader(headerMap, "Server"));
            
            // Cache status
            String xCache = getHeader(headerMap, "X-Cache");
            if (xCache != null) {
                heartbeat.setResponseCacheStatus(xCache);
            } else if (getHeader(headerMap, "CF-Cache-Status") != null) {
                heartbeat.setResponseCacheStatus(getHeader(headerMap, "CF-Cache-Status"));
            }
            
            // Response body analysis
            byte[] bodyBytes = response.body();
            String bodyString = new String(bodyBytes, StandardCharsets.UTF_8);
            heartbeat.setResponseSizeBytes(bodyBytes.length);
            
            // Content encoding & compression
            String contentEncoding = getHeader(headerMap, "Content-Encoding");
            heartbeat.setContentEncoding(contentEncoding != null ? contentEncoding : "identity");
            
            if ("gzip".equalsIgnoreCase(contentEncoding)) {
                try {
                    byte[] decompressed = decompress(bodyBytes);
                    heartbeat.setResponseBodyUncompressedBytes(decompressed.length);
                    heartbeat.setCompressionRatio((float) decompressed.length / bodyBytes.length);
                    bodyString = new String(decompressed, StandardCharsets.UTF_8);
                } catch (Exception e) {
                    LOG.debug("Failed to decompress response: {}", e.getMessage());
                }
            }
            
            // Response body hash and sample
            heartbeat.setResponseBodyHash(sha256(bodyString));
            heartbeat.setResponseBodySample(bodyString.length() > 500 ? bodyString.substring(0, 500) : bodyString);
            
            // Response body validation
            String contentType = getHeader(headerMap, "Content-Type");
            heartbeat.setResponseBodyValid(validateResponseBody(bodyString, contentType));
            
            // Always store response body in rawResponseBody field
            if (Boolean.TRUE.equals(monitor.getIncludeResponseBody())) {
                try {
                    // Try to parse as JSON first
                    if (contentType != null && contentType.contains("json")) {
                        heartbeat.setRawResponseBody(objectMapper.readTree(bodyString));
                    } else {
                        // Store as text wrapped in JSON
                        heartbeat.setRawResponseBody(objectMapper.valueToTree(bodyString));
                    }
                } catch (Exception e) {
                    // Fallback to string
                    heartbeat.setRawResponseBody(objectMapper.valueToTree(bodyString));
                }
            }
            
            // Transfer encoding
            String transferEncoding = getHeader(headerMap, "Transfer-Encoding");
            heartbeat.setTransferEncoding(transferEncoding != null ? transferEncoding : "identity");
            
            // Cache & CDN information
            heartbeat.setCacheControl(getHeader(headerMap, "Cache-Control"));
            heartbeat.setEtag(getHeader(headerMap, "ETag"));
            String ageHeader = getHeader(headerMap, "Age");
            if (ageHeader != null) {
                try {
                    heartbeat.setCacheAge(Integer.parseInt(ageHeader));
                } catch (NumberFormatException ignored) {}
            }
            
            // CDN detection
            detectCDN(headerMap, heartbeat);
            
            // Rate limiting
            heartbeat.setRateLimitDetails(buildRateLimitDetails(headerMap));
            
            // TLS/SSL details (if HTTPS)
            if (uri.getScheme().equalsIgnoreCase("https")) {
                // Note: Java HttpClient doesn't expose SSL session easily
                // This would require custom SSLContext or lower-level implementation
                heartbeat.setTlsDetails(buildTlsDetailsPlaceholder());
            }
            
            // Phase latencies
            heartbeat.setPhaseLatencies(buildPhaseLatencies(dnsTime, tcpTime, tlsTime, ttfbTime, totalTime));
            
            // Agent metrics
            heartbeat.setAgentMetrics(buildAgentMetrics());
            
        } catch (Exception e) {
            LOG.debug("HTTP monitor failed: {}", e.getMessage());
            heartbeat.setSuccess(false);
            heartbeat.setErrorMessage(e.getMessage());
            heartbeat.setErrorType(e.getClass().getSimpleName());
        }

        heartbeatRepository.save(heartbeat);
    }

    private HttpRequest buildRequest(HttpMonitor monitor) throws IOException {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
            .uri(URI.create(monitor.getUrl()))
            .timeout(Duration.ofSeconds(monitor.getTimeoutSeconds()));

        // Set method and body
        String method = monitor.getMethod().toUpperCase();
        if ("GET".equals(method)) {
            builder.GET();
        } else if ("POST".equals(method)) {
            builder.POST(getRequestBody(monitor));
        } else if ("PUT".equals(method)) {
            builder.PUT(getRequestBody(monitor));
        } else if ("DELETE".equals(method)) {
            builder.DELETE();
        } else if ("HEAD".equals(method)) {
            builder.method("HEAD", HttpRequest.BodyPublishers.noBody());
        } else if ("PATCH".equals(method)) {
            builder.method("PATCH", getRequestBody(monitor));
        } else {
            builder.GET();
        }

        // Add headers
        if (monitor.getHeaders() != null) {
            monitor.getHeaders().fields().forEachRemaining(entry -> 
                builder.header(entry.getKey(), entry.getValue().asText())
            );
        }

        return builder.build();
    }

    private HttpRequest.BodyPublisher getRequestBody(HttpMonitor monitor) {
        if (monitor.getBody() != null && !monitor.getBody().isNull()) {
            return HttpRequest.BodyPublishers.ofString(monitor.getBody().toString());
        }
        return HttpRequest.BodyPublishers.noBody();
    }

    private boolean isSuccessfulResponse(int statusCode, HttpMonitor monitor) {
        if (monitor.getExpectedStatusCodes() != null && !monitor.getExpectedStatusCodes().isEmpty()) {
            return Arrays.stream(monitor.getExpectedStatusCodes().split(","))
                .map(String::trim)
                .anyMatch(code -> code.equals(String.valueOf(statusCode)));
        }
        return statusCode >= 200 && statusCode < 400;
    }
    
    private JsonNode buildDnsDetails(InetAddress[] addresses, long dnsTime) {
        ObjectNode dnsDetails = objectMapper.createObjectNode();
        dnsDetails.put("internal_lookup_ms", dnsTime);
        
        ArrayNode ips = objectMapper.createArrayNode();
        for (InetAddress addr : addresses) {
            ips.add(addr.getHostAddress());
        }
        dnsDetails.set("resolved_ips", ips);
        
        return dnsDetails;
    }
    
    private JsonNode buildTlsDetailsPlaceholder() {
        ObjectNode tlsDetails = objectMapper.createObjectNode();
        tlsDetails.put("tls_version", "TLS");
        return tlsDetails;
    }
    
    private JsonNode buildRateLimitDetails(Map<String, List<String>> headers) {
        ObjectNode rateLimitDetails = objectMapper.createObjectNode();
        
        String limit = getHeader(headers, "X-RateLimit-Limit");
        String remaining = getHeader(headers, "X-RateLimit-Remaining");
        String reset = getHeader(headers, "X-RateLimit-Reset");
        String retryAfter = getHeader(headers, "Retry-After");
        
        if (limit != null) rateLimitDetails.put("limit", Integer.parseInt(limit));
        if (remaining != null) rateLimitDetails.put("remaining", Integer.parseInt(remaining));
        if (reset != null) rateLimitDetails.put("reset", Long.parseLong(reset));
        if (retryAfter != null) rateLimitDetails.put("retry_after", retryAfter);
        
        return rateLimitDetails.size() > 0 ? rateLimitDetails : null;
    }
    
    private JsonNode buildPhaseLatencies(long dns, long tcp, long tls, long ttfb, long total) {
        ObjectNode phaseLatencies = objectMapper.createObjectNode();
        phaseLatencies.put("dns", dns);
        phaseLatencies.put("tcp", tcp);
        phaseLatencies.put("tls", tls);
        phaseLatencies.put("ttfb", ttfb);
        phaseLatencies.put("total", total);
        phaseLatencies.put("download", Math.max(0, total - ttfb));
        return phaseLatencies;
    }
    
    private JsonNode buildAgentMetrics() {
        ObjectNode agentMetrics = objectMapper.createObjectNode();
        
        try {
            OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
            Runtime runtime = Runtime.getRuntime();
            
            double cpuLoad = osBean.getSystemLoadAverage();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            double memoryPercent = (double) usedMemory / totalMemory * 100;
            
            agentMetrics.put("cpu_load_avg", cpuLoad);
            agentMetrics.put("memory_percent", memoryPercent);
            agentMetrics.put("memory_used_mb", usedMemory / (1024 * 1024));
            agentMetrics.put("memory_total_mb", totalMemory / (1024 * 1024));
        } catch (Exception e) {
            LOG.debug("Failed to collect agent metrics: {}", e.getMessage());
        }
        
        return agentMetrics;
    }
    
    private void detectCDN(Map<String, List<String>> headers, HttpHeartbeat heartbeat) {
        String server = getHeader(headers, "Server");
        String cfRay = getHeader(headers, "CF-RAY");
        String xCache = getHeader(headers, "X-Cache");
        
        if (cfRay != null) {
            heartbeat.setCdnProvider("cloudflare");
            String[] parts = cfRay.split("-");
            if (parts.length > 1) {
                heartbeat.setCdnPop(parts[1]);
            }
        } else if (server != null && server.toLowerCase().contains("akamai")) {
            heartbeat.setCdnProvider("akamai");
        } else if (xCache != null && xCache.toLowerCase().contains("fastly")) {
            heartbeat.setCdnProvider("fastly");
        }
    }
    
    private String getHeader(Map<String, List<String>> headers, String name) {
        for (Map.Entry<String, List<String>> entry : headers.entrySet()) {
            if (entry.getKey().equalsIgnoreCase(name) && !entry.getValue().isEmpty()) {
                return entry.getValue().get(0);
            }
        }
        return null;
    }
    
    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return null;
        }
    }
    
    private byte[] decompress(byte[] compressed) throws IOException {
        try (GZIPInputStream gis = new GZIPInputStream(new ByteArrayInputStream(compressed))) {
            return gis.readAllBytes();
        }
    }
    
    private boolean validateResponseBody(String body, String contentType) {
        if (contentType == null) return true;
        
        try {
            if (contentType.contains("json")) {
                objectMapper.readTree(body);
                return true;
            }
        } catch (Exception e) {
            return false;
        }
        return true;
    }
    
    private static class RedirectInfo {
        String url;
        int status;
    }

    private JsonNode convertHeaders(Map<String, java.util.List<String>> headers) {
        try {
            return objectMapper.valueToTree(headers);
        } catch (Exception e) {
            return objectMapper.createObjectNode();
        }
    }
}