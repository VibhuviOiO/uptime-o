package uptime.observability.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import uptime.observability.service.ApiKeyService;

/**
 * Filter to authenticate requests using API keys.
 * Checks for X-API-Key header and validates it against active API keys in the database.
 * Not marked as @Component to avoid circular dependency - manually registered in SecurityConfiguration.
 */
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger LOG = LoggerFactory.getLogger(ApiKeyAuthenticationFilter.class);
    private static final String API_KEY_HEADER = "X-API-Key";

    private final ApiKeyService apiKeyService;

    public ApiKeyAuthenticationFilter(ApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String apiKey = request.getHeader(API_KEY_HEADER);

        if (apiKey != null && !apiKey.isEmpty()) {
            try {
                if (apiKeyService.validateApiKey(apiKey)) {
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        "api-agent",
                        null,
                        List.of(new SimpleGrantedAuthority(AuthoritiesConstants.API_AGENT))
                    );
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    LOG.debug("API Key authentication successful");
                } else {
                    LOG.warn("Invalid or expired API Key for {}", request.getRequestURI());
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Invalid or expired API Key\"}");
                    return;
                }
            } catch (Exception e) {
                LOG.warn("API Key validation failed for {}: {}", request.getRequestURI(), e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Invalid API Key\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getRequestURI();
        // Apply this filter to agent API endpoints and public API endpoints that accept API key authentication
        return !path.startsWith("/api/agent/") && !path.startsWith("/api/public/heartbeats") && !path.startsWith("/api/public/monitors") && !path.startsWith("/api/public/agents");
    }
}
