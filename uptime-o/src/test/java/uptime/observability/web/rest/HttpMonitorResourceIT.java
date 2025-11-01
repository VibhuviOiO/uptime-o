package uptime.observability.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static uptime.observability.domain.HttpMonitorAsserts.*;
import static uptime.observability.web.rest.TestUtil.createUpdateProxyForBean;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
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
 * Integration tests for the {@link HttpMonitorResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class HttpMonitorResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_METHOD = "AAAAAAAAAA";
    private static final String UPDATED_METHOD = "BBBBBBBBBB";

    private static final String DEFAULT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_TYPE = "BBBBBBBBBB";

    private static final String DEFAULT_URL = "AAAAAAAAAA";
    private static final String UPDATED_URL = "BBBBBBBBBB";

    private static final String DEFAULT_HEADERS = "AAAAAAAAAA";
    private static final String UPDATED_HEADERS = "BBBBBBBBBB";

    private static final String DEFAULT_BODY = "AAAAAAAAAA";
    private static final String UPDATED_BODY = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/api-monitors";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private HttpMonitorRepository apiMonitorRepository;

    @Autowired
    private HttpMonitorMapper apiMonitorMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restHttpMonitorMockMvc;

    private HttpMonitor apiMonitor;

    private HttpMonitor insertedHttpMonitor;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static HttpMonitor createEntity() {
        return new HttpMonitor()
            .name(DEFAULT_NAME)
            .method(DEFAULT_METHOD)
            .type(DEFAULT_TYPE)
            .url(DEFAULT_URL)
            .headers(DEFAULT_HEADERS)
            .body(DEFAULT_BODY);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static HttpMonitor createUpdatedEntity() {
        return new HttpMonitor()
            .name(UPDATED_NAME)
            .method(UPDATED_METHOD)
            .type(UPDATED_TYPE)
            .url(UPDATED_URL)
            .headers(UPDATED_HEADERS)
            .body(UPDATED_BODY);
    }

    @BeforeEach
    void initTest() {
        apiMonitor = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedHttpMonitor != null) {
            apiMonitorRepository.delete(insertedHttpMonitor);
            insertedHttpMonitor = null;
        }
    }

    @Test
    @Transactional
    void createHttpMonitor() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the HttpMonitor
        HttpMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);
        var returnedHttpMonitorDTO = om.readValue(
            restHttpMonitorMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(apiMonitorDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            HttpMonitorDTO.class
        );

        // Validate the HttpMonitor in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedHttpMonitor = apiMonitorMapper.toEntity(returnedHttpMonitorDTO);
        assertHttpMonitorUpdatableFieldsEquals(returnedHttpMonitor, getPersistedHttpMonitor(returnedHttpMonitor));

        insertedHttpMonitor = returnedHttpMonitor;
    }

    @Test
    @Transactional
    void createHttpMonitorWithExistingId() throws Exception {
        // Create the HttpMonitor with an existing ID
        apiMonitor.setId(1L);
        HttpMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restHttpMonitorMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(apiMonitorDTO)))
            .andExpect(status().isBadRequest());

        // Validate the HttpMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        apiMonitor.setName(null);

        // Create the HttpMonitor, which fails.
        HttpMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);

        restHttpMonitorMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(apiMonitorDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMethodIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        apiMonitor.setMethod(null);

        // Create the HttpMonitor, which fails.
        HttpMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);

        restHttpMonitorMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(apiMonitorDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTypeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        apiMonitor.setType(null);

        // Create the HttpMonitor, which fails.
        HttpMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);

        restHttpMonitorMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(apiMonitorDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllHttpMonitors() throws Exception {
        // Initialize the database
        insertedHttpMonitor = apiMonitorRepository.saveAndFlush(apiMonitor);

        // Get all the apiMonitorList
        restHttpMonitorMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(apiMonitor.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].method").value(hasItem(DEFAULT_METHOD)))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE)))
            .andExpect(jsonPath("$.[*].url").value(hasItem(DEFAULT_URL)))
            .andExpect(jsonPath("$.[*].headers").value(hasItem(DEFAULT_HEADERS)))
            .andExpect(jsonPath("$.[*].body").value(hasItem(DEFAULT_BODY)));
    }

    @Test
    @Transactional
    void getHttpMonitor() throws Exception {
        // Initialize the database
        insertedHttpMonitor = apiMonitorRepository.saveAndFlush(apiMonitor);

        // Get the apiMonitor
        restHttpMonitorMockMvc
            .perform(get(ENTITY_API_URL_ID, apiMonitor.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(apiMonitor.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.method").value(DEFAULT_METHOD))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE))
            .andExpect(jsonPath("$.url").value(DEFAULT_URL))
            .andExpect(jsonPath("$.headers").value(DEFAULT_HEADERS))
            .andExpect(jsonPath("$.body").value(DEFAULT_BODY));
    }

    @Test
    @Transactional
    void getNonExistingHttpMonitor() throws Exception {
        // Get the apiMonitor
        restHttpMonitorMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingHttpMonitor() throws Exception {
        // Initialize the database
        insertedHttpMonitor = apiMonitorRepository.saveAndFlush(apiMonitor);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the apiMonitor
        HttpMonitor updatedHttpMonitor = apiMonitorRepository.findById(apiMonitor.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedHttpMonitor are not directly saved in db
        em.detach(updatedHttpMonitor);
        updatedHttpMonitor
            .name(UPDATED_NAME)
            .method(UPDATED_METHOD)
            .type(UPDATED_TYPE)
            .url(UPDATED_URL)
            .headers(UPDATED_HEADERS)
            .body(UPDATED_BODY);
        HttpMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(updatedHttpMonitor);

        restHttpMonitorMockMvc
            .perform(
                put(ENTITY_API_URL_ID, apiMonitorDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(apiMonitorDTO))
            )
            .andExpect(status().isOk());

        // Validate the HttpMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedHttpMonitorToMatchAllProperties(updatedHttpMonitor);
    }

    @Test
    @Transactional
    void putNonExistingHttpMonitor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiMonitor.setId(longCount.incrementAndGet());

        // Create the HttpMonitor
        HttpMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restHttpMonitorMockMvc
            .perform(
                put(ENTITY_API_URL_ID, apiMonitorDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(apiMonitorDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HttpMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchHttpMonitor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiMonitor.setId(longCount.incrementAndGet());

        // Create the HttpMonitor
        HttpMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHttpMonitorMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(apiMonitorDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HttpMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamHttpMonitor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiMonitor.setId(longCount.incrementAndGet());

        // Create the HttpMonitor
        HttpMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHttpMonitorMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(apiMonitorDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the HttpMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateHttpMonitorWithPatch() throws Exception {
        // Initialize the database
        insertedHttpMonitor = apiMonitorRepository.saveAndFlush(apiMonitor);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the apiMonitor using partial update
        HttpMonitor partialUpdatedHttpMonitor = new HttpMonitor();
        partialUpdatedHttpMonitor.setId(apiMonitor.getId());

        partialUpdatedHttpMonitor.method(UPDATED_METHOD).url(UPDATED_URL).headers(UPDATED_HEADERS);

        restHttpMonitorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedHttpMonitor.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedHttpMonitor))
            )
            .andExpect(status().isOk());

        // Validate the HttpMonitor in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertHttpMonitorUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedHttpMonitor, apiMonitor),
            getPersistedHttpMonitor(apiMonitor)
        );
    }

    @Test
    @Transactional
    void fullUpdateHttpMonitorWithPatch() throws Exception {
        // Initialize the database
        insertedHttpMonitor = apiMonitorRepository.saveAndFlush(apiMonitor);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the apiMonitor using partial update
        HttpMonitor partialUpdatedHttpMonitor = new HttpMonitor();
        partialUpdatedHttpMonitor.setId(apiMonitor.getId());

        partialUpdatedHttpMonitor
            .name(UPDATED_NAME)
            .method(UPDATED_METHOD)
            .type(UPDATED_TYPE)
            .url(UPDATED_URL)
            .headers(UPDATED_HEADERS)
            .body(UPDATED_BODY);

        restHttpMonitorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedHttpMonitor.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedHttpMonitor))
            )
            .andExpect(status().isOk());

        // Validate the HttpMonitor in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertHttpMonitorUpdatableFieldsEquals(partialUpdatedHttpMonitor, getPersistedHttpMonitor(partialUpdatedHttpMonitor));
    }

    @Test
    @Transactional
    void patchNonExistingHttpMonitor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiMonitor.setId(longCount.incrementAndGet());

        // Create the HttpMonitor
        HttpMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restHttpMonitorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, apiMonitorDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(apiMonitorDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HttpMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchHttpMonitor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiMonitor.setId(longCount.incrementAndGet());

        // Create the HttpMonitor
        HttpMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHttpMonitorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(apiMonitorDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HttpMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamHttpMonitor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiMonitor.setId(longCount.incrementAndGet());

        // Create the HttpMonitor
        HttpMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHttpMonitorMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(apiMonitorDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the HttpMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteHttpMonitor() throws Exception {
        // Initialize the database
        insertedHttpMonitor = apiMonitorRepository.saveAndFlush(apiMonitor);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the apiMonitor
        restHttpMonitorMockMvc
            .perform(delete(ENTITY_API_URL_ID, apiMonitor.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return apiMonitorRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected HttpMonitor getPersistedHttpMonitor(HttpMonitor apiMonitor) {
        return apiMonitorRepository.findById(apiMonitor.getId()).orElseThrow();
    }

    protected void assertPersistedHttpMonitorToMatchAllProperties(HttpMonitor expectedHttpMonitor) {
        assertHttpMonitorAllPropertiesEquals(expectedHttpMonitor, getPersistedHttpMonitor(expectedHttpMonitor));
    }

    protected void assertPersistedHttpMonitorToMatchUpdatableProperties(HttpMonitor expectedHttpMonitor) {
        assertHttpMonitorAllUpdatablePropertiesEquals(expectedHttpMonitor, getPersistedHttpMonitor(expectedHttpMonitor));
    }
}
