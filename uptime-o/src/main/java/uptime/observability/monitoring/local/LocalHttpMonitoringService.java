package uptime.observability.monitoring.local;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import uptime.observability.domain.HttpHeartbeat;
import uptime.observability.domain.HttpMonitor;
import uptime.observability.repository.HttpHeartbeatRepository;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;

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

        try {
            HttpRequest request = buildRequest(monitor);
            long requestStart = System.nanoTime();
            
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            long responseTime = (System.nanoTime() - requestStart) / 1_000_000; // Convert to ms
            
            heartbeat.setSuccess(isSuccessfulResponse(response.statusCode()));
            heartbeat.setResponseTimeMs((int) responseTime);
            heartbeat.setResponseStatusCode(response.statusCode());
            heartbeat.setRawResponseHeaders(convertHeaders(response.headers().map()));
            
            if (Boolean.TRUE.equals(monitor.getIncludeResponseBody())) {
                heartbeat.setRawResponseBody(objectMapper.valueToTree(response.body()));
            }
            
        } catch (Exception e) {
            LOG.debug("HTTP monitor failed: {}", e.getMessage());
            heartbeat.setSuccess(false);
            heartbeat.setErrorMessage(e.getMessage());
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

    private boolean isSuccessfulResponse(int statusCode) {
        return statusCode >= 200 && statusCode < 400;
    }

    private JsonNode convertHeaders(Map<String, java.util.List<String>> headers) {
        try {
            return objectMapper.valueToTree(headers);
        } catch (Exception e) {
            return objectMapper.createObjectNode();
        }
    }
}