package uptime.observability.domain;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.type.SqlTypes;
import org.hibernate.usertype.UserType;

import java.io.Serializable;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Custom Hibernate type for JSONB columns using JsonNode
 */
public class JsonNodeType implements UserType<JsonNode> {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Override
    public int getSqlType() {
        return SqlTypes.OTHER;
    }

    @Override
    public Class<JsonNode> returnedClass() {
        return JsonNode.class;
    }

    @Override
    public boolean equals(JsonNode x, JsonNode y) {
        if (x == y) {
            return true;
        }
        if (x == null || y == null) {
            return false;
        }
        return x.equals(y);
    }

    @Override
    public int hashCode(JsonNode x) {
        return x.hashCode();
    }

    @Override
    public JsonNode nullSafeGet(ResultSet rs, int position, SharedSessionContractImplementor session, Object owner) throws SQLException {
        String json = rs.getString(position);
        if (json == null) {
            return null;
        }
        try {
            return OBJECT_MAPPER.readTree(json);
        } catch (Exception e) {
            throw new SQLException("Failed to parse JSON: " + json, e);
        }
    }

    @Override
    public void nullSafeSet(PreparedStatement st, JsonNode value, int index, SharedSessionContractImplementor session) throws SQLException {
        if (value == null || value.isNull()) {
            st.setNull(index, SqlTypes.OTHER);
        } else {
            try {
                String json = OBJECT_MAPPER.writeValueAsString(value);
                st.setObject(index, json, SqlTypes.OTHER);
            } catch (Exception e) {
                throw new SQLException("Failed to serialize JSON: " + value, e);
            }
        }
    }

    @Override
    public JsonNode deepCopy(JsonNode value) {
        if (value == null) {
            return null;
        }
        try {
            return OBJECT_MAPPER.readTree(OBJECT_MAPPER.writeValueAsString(value));
        } catch (Exception e) {
            throw new RuntimeException("Failed to deep copy JsonNode", e);
        }
    }

    @Override
    public boolean isMutable() {
        return true;
    }

    @Override
    public Serializable disassemble(JsonNode value) {
        return (Serializable) deepCopy(value);
    }

    @Override
    public JsonNode assemble(Serializable cached, Object owner) {
        return deepCopy((JsonNode) cached);
    }

    @Override
    public JsonNode replace(JsonNode detached, JsonNode managed, Object owner) {
        return deepCopy(detached);
    }
}