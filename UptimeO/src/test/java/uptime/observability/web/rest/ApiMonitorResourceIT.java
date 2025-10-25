package uptime.observability.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static uptime.observability.domain.ApiMonitorAsserts.*;
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
import uptime.observability.domain.ApiMonitor;
import uptime.observability.repository.ApiMonitorRepository;
import uptime.observability.service.dto.ApiMonitorDTO;
import uptime.observability.service.mapper.ApiMonitorMapper;

/**
 * Integration tests for the {@link ApiMonitorResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ApiMonitorResourceIT {

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
    private ApiMonitorRepository apiMonitorRepository;

    @Autowired
    private ApiMonitorMapper apiMonitorMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restApiMonitorMockMvc;

    private ApiMonitor apiMonitor;

    private ApiMonitor insertedApiMonitor;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ApiMonitor createEntity() {
        return new ApiMonitor()
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
    public static ApiMonitor createUpdatedEntity() {
        return new ApiMonitor()
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
        if (insertedApiMonitor != null) {
            apiMonitorRepository.delete(insertedApiMonitor);
            insertedApiMonitor = null;
        }
    }

    @Test
    @Transactional
    void createApiMonitor() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the ApiMonitor
        ApiMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);
        var returnedApiMonitorDTO = om.readValue(
            restApiMonitorMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(apiMonitorDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ApiMonitorDTO.class
        );

        // Validate the ApiMonitor in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedApiMonitor = apiMonitorMapper.toEntity(returnedApiMonitorDTO);
        assertApiMonitorUpdatableFieldsEquals(returnedApiMonitor, getPersistedApiMonitor(returnedApiMonitor));

        insertedApiMonitor = returnedApiMonitor;
    }

    @Test
    @Transactional
    void createApiMonitorWithExistingId() throws Exception {
        // Create the ApiMonitor with an existing ID
        apiMonitor.setId(1L);
        ApiMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restApiMonitorMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(apiMonitorDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ApiMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        apiMonitor.setName(null);

        // Create the ApiMonitor, which fails.
        ApiMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);

        restApiMonitorMockMvc
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

        // Create the ApiMonitor, which fails.
        ApiMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);

        restApiMonitorMockMvc
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

        // Create the ApiMonitor, which fails.
        ApiMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);

        restApiMonitorMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(apiMonitorDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllApiMonitors() throws Exception {
        // Initialize the database
        insertedApiMonitor = apiMonitorRepository.saveAndFlush(apiMonitor);

        // Get all the apiMonitorList
        restApiMonitorMockMvc
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
    void getApiMonitor() throws Exception {
        // Initialize the database
        insertedApiMonitor = apiMonitorRepository.saveAndFlush(apiMonitor);

        // Get the apiMonitor
        restApiMonitorMockMvc
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
    void getNonExistingApiMonitor() throws Exception {
        // Get the apiMonitor
        restApiMonitorMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingApiMonitor() throws Exception {
        // Initialize the database
        insertedApiMonitor = apiMonitorRepository.saveAndFlush(apiMonitor);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the apiMonitor
        ApiMonitor updatedApiMonitor = apiMonitorRepository.findById(apiMonitor.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedApiMonitor are not directly saved in db
        em.detach(updatedApiMonitor);
        updatedApiMonitor
            .name(UPDATED_NAME)
            .method(UPDATED_METHOD)
            .type(UPDATED_TYPE)
            .url(UPDATED_URL)
            .headers(UPDATED_HEADERS)
            .body(UPDATED_BODY);
        ApiMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(updatedApiMonitor);

        restApiMonitorMockMvc
            .perform(
                put(ENTITY_API_URL_ID, apiMonitorDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(apiMonitorDTO))
            )
            .andExpect(status().isOk());

        // Validate the ApiMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedApiMonitorToMatchAllProperties(updatedApiMonitor);
    }

    @Test
    @Transactional
    void putNonExistingApiMonitor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiMonitor.setId(longCount.incrementAndGet());

        // Create the ApiMonitor
        ApiMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restApiMonitorMockMvc
            .perform(
                put(ENTITY_API_URL_ID, apiMonitorDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(apiMonitorDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ApiMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchApiMonitor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiMonitor.setId(longCount.incrementAndGet());

        // Create the ApiMonitor
        ApiMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restApiMonitorMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(apiMonitorDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ApiMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamApiMonitor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiMonitor.setId(longCount.incrementAndGet());

        // Create the ApiMonitor
        ApiMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restApiMonitorMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(apiMonitorDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ApiMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateApiMonitorWithPatch() throws Exception {
        // Initialize the database
        insertedApiMonitor = apiMonitorRepository.saveAndFlush(apiMonitor);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the apiMonitor using partial update
        ApiMonitor partialUpdatedApiMonitor = new ApiMonitor();
        partialUpdatedApiMonitor.setId(apiMonitor.getId());

        partialUpdatedApiMonitor.method(UPDATED_METHOD).url(UPDATED_URL).headers(UPDATED_HEADERS);

        restApiMonitorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedApiMonitor.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedApiMonitor))
            )
            .andExpect(status().isOk());

        // Validate the ApiMonitor in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertApiMonitorUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedApiMonitor, apiMonitor),
            getPersistedApiMonitor(apiMonitor)
        );
    }

    @Test
    @Transactional
    void fullUpdateApiMonitorWithPatch() throws Exception {
        // Initialize the database
        insertedApiMonitor = apiMonitorRepository.saveAndFlush(apiMonitor);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the apiMonitor using partial update
        ApiMonitor partialUpdatedApiMonitor = new ApiMonitor();
        partialUpdatedApiMonitor.setId(apiMonitor.getId());

        partialUpdatedApiMonitor
            .name(UPDATED_NAME)
            .method(UPDATED_METHOD)
            .type(UPDATED_TYPE)
            .url(UPDATED_URL)
            .headers(UPDATED_HEADERS)
            .body(UPDATED_BODY);

        restApiMonitorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedApiMonitor.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedApiMonitor))
            )
            .andExpect(status().isOk());

        // Validate the ApiMonitor in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertApiMonitorUpdatableFieldsEquals(partialUpdatedApiMonitor, getPersistedApiMonitor(partialUpdatedApiMonitor));
    }

    @Test
    @Transactional
    void patchNonExistingApiMonitor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiMonitor.setId(longCount.incrementAndGet());

        // Create the ApiMonitor
        ApiMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restApiMonitorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, apiMonitorDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(apiMonitorDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ApiMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchApiMonitor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiMonitor.setId(longCount.incrementAndGet());

        // Create the ApiMonitor
        ApiMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restApiMonitorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(apiMonitorDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ApiMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamApiMonitor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiMonitor.setId(longCount.incrementAndGet());

        // Create the ApiMonitor
        ApiMonitorDTO apiMonitorDTO = apiMonitorMapper.toDto(apiMonitor);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restApiMonitorMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(apiMonitorDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ApiMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteApiMonitor() throws Exception {
        // Initialize the database
        insertedApiMonitor = apiMonitorRepository.saveAndFlush(apiMonitor);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the apiMonitor
        restApiMonitorMockMvc
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

    protected ApiMonitor getPersistedApiMonitor(ApiMonitor apiMonitor) {
        return apiMonitorRepository.findById(apiMonitor.getId()).orElseThrow();
    }

    protected void assertPersistedApiMonitorToMatchAllProperties(ApiMonitor expectedApiMonitor) {
        assertApiMonitorAllPropertiesEquals(expectedApiMonitor, getPersistedApiMonitor(expectedApiMonitor));
    }

    protected void assertPersistedApiMonitorToMatchUpdatableProperties(ApiMonitor expectedApiMonitor) {
        assertApiMonitorAllUpdatablePropertiesEquals(expectedApiMonitor, getPersistedApiMonitor(expectedApiMonitor));
    }
}
