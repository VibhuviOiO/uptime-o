package uptime.observability.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import uptime.observability.IntegrationTest;
import uptime.observability.domain.HttpMonitor;
import uptime.observability.repository.HttpMonitorRepository;
import uptime.observability.service.dto.HttpMonitorDTO;
import uptime.observability.service.mapper.HttpMonitorMapper;

/**
 * Integration tests for Monitor Group functionality.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class HttpMonitorGroupIT {

    private static final String ENTITY_API_URL = "/api/http-monitors";

    @Autowired
    private ObjectMapper om;

    @Autowired
    private HttpMonitorRepository httpMonitorRepository;

    @Autowired
    private HttpMonitorMapper httpMonitorMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restHttpMonitorMockMvc;

    private HttpMonitor groupMonitor;
    private HttpMonitor childMonitor;

    @BeforeEach
    void initTest() {
        groupMonitor = new HttpMonitor()
            .name("Test Group")
            .method("GET")
            .type("group")
            .intervalSeconds(60)
            .timeoutSeconds(30)
            .retryCount(2)
            .retryDelaySeconds(5);

        childMonitor = new HttpMonitor()
            .name("Child Monitor")
            .method("GET")
            .type("http")
            .url("https://example.com")
            .intervalSeconds(60)
            .timeoutSeconds(30)
            .retryCount(2)
            .retryDelaySeconds(5);
    }

    @AfterEach
    void cleanup() {
        httpMonitorRepository.deleteAll();
    }

    @Test
    @Transactional
    void createGroupMonitorWithoutUrl() throws Exception {
        long databaseSizeBeforeCreate = httpMonitorRepository.count();

        HttpMonitorDTO groupDTO = httpMonitorMapper.toDto(groupMonitor);

        restHttpMonitorMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(groupDTO)))
            .andExpect(status().isCreated());

        assertThat(httpMonitorRepository.count()).isEqualTo(databaseSizeBeforeCreate + 1);
    }

    @Test
    @Transactional
    void createChildMonitorWithParent() throws Exception {
        HttpMonitor savedGroup = httpMonitorRepository.saveAndFlush(groupMonitor);

        childMonitor.setParent(savedGroup);
        HttpMonitorDTO childDTO = httpMonitorMapper.toDto(childMonitor);

        restHttpMonitorMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(childDTO)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.parentId").value(savedGroup.getId()));
    }

    @Test
    @Transactional
    void getGroupMonitorWithChildren() throws Exception {
        HttpMonitor savedGroup = httpMonitorRepository.saveAndFlush(groupMonitor);
        
        childMonitor.setParent(savedGroup);
        httpMonitorRepository.saveAndFlush(childMonitor);

        restHttpMonitorMockMvc
            .perform(get(ENTITY_API_URL + "/{id}", savedGroup.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.type").value("group"))
            .andExpect(jsonPath("$.name").value("Test Group"));
    }

    @Test
    @Transactional
    void groupMonitorCanHaveNullUrl() throws Exception {
        HttpMonitor savedGroup = httpMonitorRepository.saveAndFlush(groupMonitor);
        
        assertThat(savedGroup.getUrl()).isNull();
        assertThat(savedGroup.getType()).isEqualTo("group");
    }



    @Test
    @Transactional
    void nonGroupMonitorRequiresUrl() throws Exception {
        HttpMonitor monitor = new HttpMonitor()
            .name("Test Monitor")
            .method("GET")
            .type("http")
            .intervalSeconds(60)
            .timeoutSeconds(30)
            .retryCount(2)
            .retryDelaySeconds(5);

        HttpMonitorDTO dto = httpMonitorMapper.toDto(monitor);

        restHttpMonitorMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(dto)))
            .andExpect(status().isBadRequest());
    }
}
