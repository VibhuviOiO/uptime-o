package uptime.observability.security;

/**
 * Constants for Spring Security authorities.
 */
public final class AuthoritiesConstants {

    public static final String ADMIN = "ROLE_ADMIN";

    public static final String USER = "ROLE_USER";

    public static final String ANONYMOUS = "ROLE_ANONYMOUS";

    public static final String API_AGENT = "ROLE_API_AGENT";

    public static final String SUPPORT_ROLE = "ROLE_SUPPORT";

    public static final String INFRA_TEAM_ROLE = "ROLE_INFRA_TEAM";

    public static final String SUPER_ADMIN = "ROLE_SUPER_ADMIN";

    private AuthoritiesConstants() {}
}
