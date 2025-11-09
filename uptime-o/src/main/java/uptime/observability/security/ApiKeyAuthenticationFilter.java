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
            LOG.debug("API Key found in request header, attempting authentication");

            if (apiKeyService.validateApiKey(apiKey)) {
                LOG.debug("API Key is valid, setting authentication context");

                // Create authentication token with ROLE_API_AGENT authority
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    "api-agent",
                    null,
                    List.of(new SimpleGrantedAuthority(AuthoritiesConstants.API_AGENT))
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
                LOG.debug("API Key authentication successful");
            } else {
                LOG.warn("Invalid API Key provided");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid API Key");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getRequestURI();
        // Only apply this filter to public heartbeat endpoints
        return !path.startsWith("/api/public/heartbeats");
    }
}
