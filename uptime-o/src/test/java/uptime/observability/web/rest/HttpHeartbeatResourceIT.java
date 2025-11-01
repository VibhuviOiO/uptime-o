package uptime.observability.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static uptime.observability.domain.HttpHeartbeatAsserts.*;
import static uptime.observability.web.rest.TestUtil.createUpdateProxyForBean;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
import uptime.observability.domain.HttpHeartbeat;
import uptime.observability.repository.HttpHeartbeatRepository;
import uptime.observability.service.dto.HttpHeartbeatDTO;
import uptime.observability.service.mapper.HttpHeartbeatMapper;

/**
 * Integration tests for the {@link HttpHeartbeatResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class HttpHeartbeatResourceIT {

    private static final Instant DEFAULT_EXECUTED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_EXECUTED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Boolean DEFAULT_SUCCESS = false;
    private static final Boolean UPDATED_SUCCESS = true;

    private static final Integer DEFAULT_RESPONSE_TIME_MS = 1;
    private static final Integer UPDATED_RESPONSE_TIME_MS = 2;

    private static final Integer DEFAULT_RESPONSE_SIZE_BYTES = 1;
    private static final Integer UPDATED_RESPONSE_SIZE_BYTES = 2;

    private static final Integer DEFAULT_RESPONSE_STATUS_CODE = 1;
    private static final Integer UPDATED_RESPONSE_STATUS_CODE = 2;

    private static final String DEFAULT_RESPONSE_CONTENT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_RESPONSE_CONTENT_TYPE = "BBBBBBBBBB";

    private static final String DEFAULT_RESPONSE_SERVER = "AAAAAAAAAA";
    private static final String UPDATED_RESPONSE_SERVER = "BBBBBBBBBB";

    private static final String DEFAULT_RESPONSE_CACHE_STATUS = "AAAAAAAAAA";
    private static final String UPDATED_RESPONSE_CACHE_STATUS = "BBBBBBBBBB";

    private static final Integer DEFAULT_DNS_LOOKUP_MS = 1;
    private static final Integer UPDATED_DNS_LOOKUP_MS = 2;

    private static final Integer DEFAULT_TCP_CONNECT_MS = 1;
    private static final Integer UPDATED_TCP_CONNECT_MS = 2;

    private static final Integer DEFAULT_TLS_HANDSHAKE_MS = 1;
    private static final Integer UPDATED_TLS_HANDSHAKE_MS = 2;

    private static final Integer DEFAULT_TIME_TO_FIRST_BYTE_MS = 1;
    private static final Integer UPDATED_TIME_TO_FIRST_BYTE_MS = 2;

    private static final Integer DEFAULT_WARNING_THRESHOLD_MS = 1;
    private static final Integer UPDATED_WARNING_THRESHOLD_MS = 2;

    private static final Integer DEFAULT_CRITICAL_THRESHOLD_MS = 1;
    private static final Integer UPDATED_CRITICAL_THRESHOLD_MS = 2;

    private static final String DEFAULT_ERROR_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_ERROR_TYPE = "BBBBBBBBBB";

    private static final String DEFAULT_ERROR_MESSAGE = "AAAAAAAAAA";
    private static final String UPDATED_ERROR_MESSAGE = "BBBBBBBBBB";

    private static final String DEFAULT_RAW_REQUEST_HEADERS = "AAAAAAAAAA";
    private static final String UPDATED_RAW_REQUEST_HEADERS = "BBBBBBBBBB";

    private static final String DEFAULT_RAW_RESPONSE_HEADERS = "AAAAAAAAAA";
    private static final String UPDATED_RAW_RESPONSE_HEADERS = "BBBBBBBBBB";

    private static final String DEFAULT_RAW_RESPONSE_BODY = "AAAAAAAAAA";
    private static final String UPDATED_RAW_RESPONSE_BODY = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/api-heartbeats";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private HttpHeartbeatRepository apiHeartbeatRepository;

    @Autowired
    private HttpHeartbeatMapper apiHeartbeatMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restApiHeartbeatMockMvc;

    private HttpHeartbeat apiHeartbeat;

    private HttpHeartbeat insertedApiHeartbeat;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static HttpHeartbeat createEntity() {
        return new HttpHeartbeat()
            .executedAt(DEFAULT_EXECUTED_AT)
            .success(DEFAULT_SUCCESS)
            .responseTimeMs(DEFAULT_RESPONSE_TIME_MS)
            .responseSizeBytes(DEFAULT_RESPONSE_SIZE_BYTES)
            .responseStatusCode(DEFAULT_RESPONSE_STATUS_CODE)
            .responseContentType(DEFAULT_RESPONSE_CONTENT_TYPE)
            .responseServer(DEFAULT_RESPONSE_SERVER)
            .responseCacheStatus(DEFAULT_RESPONSE_CACHE_STATUS)
            .dnsLookupMs(DEFAULT_DNS_LOOKUP_MS)
            .tcpConnectMs(DEFAULT_TCP_CONNECT_MS)
            .tlsHandshakeMs(DEFAULT_TLS_HANDSHAKE_MS)
            .timeToFirstByteMs(DEFAULT_TIME_TO_FIRST_BYTE_MS)
            .warningThresholdMs(DEFAULT_WARNING_THRESHOLD_MS)
            .criticalThresholdMs(DEFAULT_CRITICAL_THRESHOLD_MS)
            .errorType(DEFAULT_ERROR_TYPE)
            .errorMessage(DEFAULT_ERROR_MESSAGE)
            .rawRequestHeaders(DEFAULT_RAW_REQUEST_HEADERS)
            .rawResponseHeaders(DEFAULT_RAW_RESPONSE_HEADERS)
            .rawResponseBody(DEFAULT_RAW_RESPONSE_BODY);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static HttpHeartbeat createUpdatedEntity() {
        return new HttpHeartbeat()
            .executedAt(UPDATED_EXECUTED_AT)
            .success(UPDATED_SUCCESS)
            .responseTimeMs(UPDATED_RESPONSE_TIME_MS)
            .responseSizeBytes(UPDATED_RESPONSE_SIZE_BYTES)
            .responseStatusCode(UPDATED_RESPONSE_STATUS_CODE)
            .responseContentType(UPDATED_RESPONSE_CONTENT_TYPE)
            .responseServer(UPDATED_RESPONSE_SERVER)
            .responseCacheStatus(UPDATED_RESPONSE_CACHE_STATUS)
            .dnsLookupMs(UPDATED_DNS_LOOKUP_MS)
            .tcpConnectMs(UPDATED_TCP_CONNECT_MS)
            .tlsHandshakeMs(UPDATED_TLS_HANDSHAKE_MS)
            .timeToFirstByteMs(UPDATED_TIME_TO_FIRST_BYTE_MS)
            .warningThresholdMs(UPDATED_WARNING_THRESHOLD_MS)
            .criticalThresholdMs(UPDATED_CRITICAL_THRESHOLD_MS)
            .errorType(UPDATED_ERROR_TYPE)
            .errorMessage(UPDATED_ERROR_MESSAGE)
            .rawRequestHeaders(UPDATED_RAW_REQUEST_HEADERS)
            .rawResponseHeaders(UPDATED_RAW_RESPONSE_HEADERS)
            .rawResponseBody(UPDATED_RAW_RESPONSE_BODY);
    }

    @BeforeEach
    void initTest() {
        apiHeartbeat = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedApiHeartbeat != null) {
            apiHeartbeatRepository.delete(insertedApiHeartbeat);
            insertedApiHeartbeat = null;
        }
    }

    @Test
    @Transactional
    void createApiHeartbeat() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the ApiHeartbeat
        HttpHeartbeatDTO apiHeartbeatDTO = apiHeartbeatMapper.toDto(apiHeartbeat);
        var returnedApiHeartbeatDTO = om.readValue(
            restApiHeartbeatMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(apiHeartbeatDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            HttpHeartbeatDTO.class
        );

        // Validate the ApiHeartbeat in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedApiHeartbeat = apiHeartbeatMapper.toEntity(returnedApiHeartbeatDTO);
        assertApiHeartbeatUpdatableFieldsEquals(returnedApiHeartbeat, getPersistedApiHeartbeat(returnedApiHeartbeat));

        insertedApiHeartbeat = returnedApiHeartbeat;
    }

    @Test
    @Transactional
    void createApiHeartbeatWithExistingId() throws Exception {
        // Create the ApiHeartbeat with an existing ID
        apiHeartbeat.setId(1L);
        HttpHeartbeatDTO apiHeartbeatDTO = apiHeartbeatMapper.toDto(apiHeartbeat);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restApiHeartbeatMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(apiHeartbeatDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ApiHeartbeat in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkExecutedAtIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        apiHeartbeat.setExecutedAt(null);

        // Create the ApiHeartbeat, which fails.
        HttpHeartbeatDTO apiHeartbeatDTO = apiHeartbeatMapper.toDto(apiHeartbeat);

        restApiHeartbeatMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(apiHeartbeatDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllApiHeartbeats() throws Exception {
        // Initialize the database
        insertedApiHeartbeat = apiHeartbeatRepository.saveAndFlush(apiHeartbeat);

        // Get all the apiHeartbeatList
        restApiHeartbeatMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(apiHeartbeat.getId().intValue())))
            .andExpect(jsonPath("$.[*].executedAt").value(hasItem(DEFAULT_EXECUTED_AT.toString())))
            .andExpect(jsonPath("$.[*].success").value(hasItem(DEFAULT_SUCCESS)))
            .andExpect(jsonPath("$.[*].responseTimeMs").value(hasItem(DEFAULT_RESPONSE_TIME_MS)))
            .andExpect(jsonPath("$.[*].responseSizeBytes").value(hasItem(DEFAULT_RESPONSE_SIZE_BYTES)))
            .andExpect(jsonPath("$.[*].responseStatusCode").value(hasItem(DEFAULT_RESPONSE_STATUS_CODE)))
            .andExpect(jsonPath("$.[*].responseContentType").value(hasItem(DEFAULT_RESPONSE_CONTENT_TYPE)))
            .andExpect(jsonPath("$.[*].responseServer").value(hasItem(DEFAULT_RESPONSE_SERVER)))
            .andExpect(jsonPath("$.[*].responseCacheStatus").value(hasItem(DEFAULT_RESPONSE_CACHE_STATUS)))
            .andExpect(jsonPath("$.[*].dnsLookupMs").value(hasItem(DEFAULT_DNS_LOOKUP_MS)))
            .andExpect(jsonPath("$.[*].tcpConnectMs").value(hasItem(DEFAULT_TCP_CONNECT_MS)))
            .andExpect(jsonPath("$.[*].tlsHandshakeMs").value(hasItem(DEFAULT_TLS_HANDSHAKE_MS)))
            .andExpect(jsonPath("$.[*].timeToFirstByteMs").value(hasItem(DEFAULT_TIME_TO_FIRST_BYTE_MS)))
            .andExpect(jsonPath("$.[*].warningThresholdMs").value(hasItem(DEFAULT_WARNING_THRESHOLD_MS)))
            .andExpect(jsonPath("$.[*].criticalThresholdMs").value(hasItem(DEFAULT_CRITICAL_THRESHOLD_MS)))
            .andExpect(jsonPath("$.[*].errorType").value(hasItem(DEFAULT_ERROR_TYPE)))
            .andExpect(jsonPath("$.[*].errorMessage").value(hasItem(DEFAULT_ERROR_MESSAGE)))
            .andExpect(jsonPath("$.[*].rawRequestHeaders").value(hasItem(DEFAULT_RAW_REQUEST_HEADERS)))
            .andExpect(jsonPath("$.[*].rawResponseHeaders").value(hasItem(DEFAULT_RAW_RESPONSE_HEADERS)))
            .andExpect(jsonPath("$.[*].rawResponseBody").value(hasItem(DEFAULT_RAW_RESPONSE_BODY)));
    }

    @Test
    @Transactional
    void getApiHeartbeat() throws Exception {
        // Initialize the database
        insertedApiHeartbeat = apiHeartbeatRepository.saveAndFlush(apiHeartbeat);

        // Get the apiHeartbeat
        restApiHeartbeatMockMvc
            .perform(get(ENTITY_API_URL_ID, apiHeartbeat.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(apiHeartbeat.getId().intValue()))
            .andExpect(jsonPath("$.executedAt").value(DEFAULT_EXECUTED_AT.toString()))
            .andExpect(jsonPath("$.success").value(DEFAULT_SUCCESS))
            .andExpect(jsonPath("$.responseTimeMs").value(DEFAULT_RESPONSE_TIME_MS))
            .andExpect(jsonPath("$.responseSizeBytes").value(DEFAULT_RESPONSE_SIZE_BYTES))
            .andExpect(jsonPath("$.responseStatusCode").value(DEFAULT_RESPONSE_STATUS_CODE))
            .andExpect(jsonPath("$.responseContentType").value(DEFAULT_RESPONSE_CONTENT_TYPE))
            .andExpect(jsonPath("$.responseServer").value(DEFAULT_RESPONSE_SERVER))
            .andExpect(jsonPath("$.responseCacheStatus").value(DEFAULT_RESPONSE_CACHE_STATUS))
            .andExpect(jsonPath("$.dnsLookupMs").value(DEFAULT_DNS_LOOKUP_MS))
            .andExpect(jsonPath("$.tcpConnectMs").value(DEFAULT_TCP_CONNECT_MS))
            .andExpect(jsonPath("$.tlsHandshakeMs").value(DEFAULT_TLS_HANDSHAKE_MS))
            .andExpect(jsonPath("$.timeToFirstByteMs").value(DEFAULT_TIME_TO_FIRST_BYTE_MS))
            .andExpect(jsonPath("$.warningThresholdMs").value(DEFAULT_WARNING_THRESHOLD_MS))
            .andExpect(jsonPath("$.criticalThresholdMs").value(DEFAULT_CRITICAL_THRESHOLD_MS))
            .andExpect(jsonPath("$.errorType").value(DEFAULT_ERROR_TYPE))
            .andExpect(jsonPath("$.errorMessage").value(DEFAULT_ERROR_MESSAGE))
            .andExpect(jsonPath("$.rawRequestHeaders").value(DEFAULT_RAW_REQUEST_HEADERS))
            .andExpect(jsonPath("$.rawResponseHeaders").value(DEFAULT_RAW_RESPONSE_HEADERS))
            .andExpect(jsonPath("$.rawResponseBody").value(DEFAULT_RAW_RESPONSE_BODY));
    }

    @Test
    @Transactional
    void getNonExistingApiHeartbeat() throws Exception {
        // Get the apiHeartbeat
        restApiHeartbeatMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingApiHeartbeat() throws Exception {
        // Initialize the database
        insertedApiHeartbeat = apiHeartbeatRepository.saveAndFlush(apiHeartbeat);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the apiHeartbeat
        HttpHeartbeat updatedApiHeartbeat = apiHeartbeatRepository.findById(apiHeartbeat.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedApiHeartbeat are not directly saved in db
        em.detach(updatedApiHeartbeat);
        updatedApiHeartbeat
            .executedAt(UPDATED_EXECUTED_AT)
            .success(UPDATED_SUCCESS)
            .responseTimeMs(UPDATED_RESPONSE_TIME_MS)
            .responseSizeBytes(UPDATED_RESPONSE_SIZE_BYTES)
            .responseStatusCode(UPDATED_RESPONSE_STATUS_CODE)
            .responseContentType(UPDATED_RESPONSE_CONTENT_TYPE)
            .responseServer(UPDATED_RESPONSE_SERVER)
            .responseCacheStatus(UPDATED_RESPONSE_CACHE_STATUS)
            .dnsLookupMs(UPDATED_DNS_LOOKUP_MS)
            .tcpConnectMs(UPDATED_TCP_CONNECT_MS)
            .tlsHandshakeMs(UPDATED_TLS_HANDSHAKE_MS)
            .timeToFirstByteMs(UPDATED_TIME_TO_FIRST_BYTE_MS)
            .warningThresholdMs(UPDATED_WARNING_THRESHOLD_MS)
            .criticalThresholdMs(UPDATED_CRITICAL_THRESHOLD_MS)
            .errorType(UPDATED_ERROR_TYPE)
            .errorMessage(UPDATED_ERROR_MESSAGE)
            .rawRequestHeaders(UPDATED_RAW_REQUEST_HEADERS)
            .rawResponseHeaders(UPDATED_RAW_RESPONSE_HEADERS)
            .rawResponseBody(UPDATED_RAW_RESPONSE_BODY);
        HttpHeartbeatDTO apiHeartbeatDTO = apiHeartbeatMapper.toDto(updatedApiHeartbeat);

        restApiHeartbeatMockMvc
            .perform(
                put(ENTITY_API_URL_ID, apiHeartbeatDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(apiHeartbeatDTO))
            )
            .andExpect(status().isOk());

        // Validate the ApiHeartbeat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedApiHeartbeatToMatchAllProperties(updatedApiHeartbeat);
    }

    @Test
    @Transactional
    void putNonExistingApiHeartbeat() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiHeartbeat.setId(longCount.incrementAndGet());

        // Create the ApiHeartbeat
        HttpHeartbeatDTO apiHeartbeatDTO = apiHeartbeatMapper.toDto(apiHeartbeat);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restApiHeartbeatMockMvc
            .perform(
                put(ENTITY_API_URL_ID, apiHeartbeatDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(apiHeartbeatDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ApiHeartbeat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchApiHeartbeat() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiHeartbeat.setId(longCount.incrementAndGet());

        // Create the ApiHeartbeat
        HttpHeartbeatDTO apiHeartbeatDTO = apiHeartbeatMapper.toDto(apiHeartbeat);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restApiHeartbeatMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(apiHeartbeatDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ApiHeartbeat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamApiHeartbeat() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiHeartbeat.setId(longCount.incrementAndGet());

        // Create the ApiHeartbeat
        HttpHeartbeatDTO apiHeartbeatDTO = apiHeartbeatMapper.toDto(apiHeartbeat);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restApiHeartbeatMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(apiHeartbeatDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ApiHeartbeat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateApiHeartbeatWithPatch() throws Exception {
        // Initialize the database
        insertedApiHeartbeat = apiHeartbeatRepository.saveAndFlush(apiHeartbeat);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the apiHeartbeat using partial update
        HttpHeartbeat partialUpdatedApiHeartbeat = new HttpHeartbeat();
        partialUpdatedApiHeartbeat.setId(apiHeartbeat.getId());

        partialUpdatedApiHeartbeat
            .executedAt(UPDATED_EXECUTED_AT)
            .success(UPDATED_SUCCESS)
            .responseTimeMs(UPDATED_RESPONSE_TIME_MS)
            .responseSizeBytes(UPDATED_RESPONSE_SIZE_BYTES)
            .responseContentType(UPDATED_RESPONSE_CONTENT_TYPE)
            .responseServer(UPDATED_RESPONSE_SERVER)
            .responseCacheStatus(UPDATED_RESPONSE_CACHE_STATUS)
            .tlsHandshakeMs(UPDATED_TLS_HANDSHAKE_MS)
            .timeToFirstByteMs(UPDATED_TIME_TO_FIRST_BYTE_MS)
            .warningThresholdMs(UPDATED_WARNING_THRESHOLD_MS)
            .errorType(UPDATED_ERROR_TYPE)
            .rawResponseHeaders(UPDATED_RAW_RESPONSE_HEADERS);

        restApiHeartbeatMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedApiHeartbeat.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedApiHeartbeat))
            )
            .andExpect(status().isOk());

        // Validate the ApiHeartbeat in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertApiHeartbeatUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedApiHeartbeat, apiHeartbeat),
            getPersistedApiHeartbeat(apiHeartbeat)
        );
    }

    @Test
    @Transactional
    void fullUpdateApiHeartbeatWithPatch() throws Exception {
        // Initialize the database
        insertedApiHeartbeat = apiHeartbeatRepository.saveAndFlush(apiHeartbeat);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the apiHeartbeat using partial update
        HttpHeartbeat partialUpdatedApiHeartbeat = new HttpHeartbeat();
        partialUpdatedApiHeartbeat.setId(apiHeartbeat.getId());

        partialUpdatedApiHeartbeat
            .executedAt(UPDATED_EXECUTED_AT)
            .success(UPDATED_SUCCESS)
            .responseTimeMs(UPDATED_RESPONSE_TIME_MS)
            .responseSizeBytes(UPDATED_RESPONSE_SIZE_BYTES)
            .responseStatusCode(UPDATED_RESPONSE_STATUS_CODE)
            .responseContentType(UPDATED_RESPONSE_CONTENT_TYPE)
            .responseServer(UPDATED_RESPONSE_SERVER)
            .responseCacheStatus(UPDATED_RESPONSE_CACHE_STATUS)
            .dnsLookupMs(UPDATED_DNS_LOOKUP_MS)
            .tcpConnectMs(UPDATED_TCP_CONNECT_MS)
            .tlsHandshakeMs(UPDATED_TLS_HANDSHAKE_MS)
            .timeToFirstByteMs(UPDATED_TIME_TO_FIRST_BYTE_MS)
            .warningThresholdMs(UPDATED_WARNING_THRESHOLD_MS)
            .criticalThresholdMs(UPDATED_CRITICAL_THRESHOLD_MS)
            .errorType(UPDATED_ERROR_TYPE)
            .errorMessage(UPDATED_ERROR_MESSAGE)
            .rawRequestHeaders(UPDATED_RAW_REQUEST_HEADERS)
            .rawResponseHeaders(UPDATED_RAW_RESPONSE_HEADERS)
            .rawResponseBody(UPDATED_RAW_RESPONSE_BODY);

        restApiHeartbeatMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedApiHeartbeat.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedApiHeartbeat))
            )
            .andExpect(status().isOk());

        // Validate the ApiHeartbeat in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertApiHeartbeatUpdatableFieldsEquals(partialUpdatedApiHeartbeat, getPersistedApiHeartbeat(partialUpdatedApiHeartbeat));
    }

    @Test
    @Transactional
    void patchNonExistingApiHeartbeat() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiHeartbeat.setId(longCount.incrementAndGet());

        // Create the ApiHeartbeat
        HttpHeartbeatDTO apiHeartbeatDTO = apiHeartbeatMapper.toDto(apiHeartbeat);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restApiHeartbeatMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, apiHeartbeatDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(apiHeartbeatDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ApiHeartbeat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchApiHeartbeat() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiHeartbeat.setId(longCount.incrementAndGet());

        // Create the ApiHeartbeat
        HttpHeartbeatDTO apiHeartbeatDTO = apiHeartbeatMapper.toDto(apiHeartbeat);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restApiHeartbeatMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(apiHeartbeatDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ApiHeartbeat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamApiHeartbeat() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiHeartbeat.setId(longCount.incrementAndGet());

        // Create the ApiHeartbeat
        HttpHeartbeatDTO apiHeartbeatDTO = apiHeartbeatMapper.toDto(apiHeartbeat);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restApiHeartbeatMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(apiHeartbeatDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ApiHeartbeat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteApiHeartbeat() throws Exception {
        // Initialize the database
        insertedApiHeartbeat = apiHeartbeatRepository.saveAndFlush(apiHeartbeat);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the apiHeartbeat
        restApiHeartbeatMockMvc
            .perform(delete(ENTITY_API_URL_ID, apiHeartbeat.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return apiHeartbeatRepository.count();
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

    protected HttpHeartbeat getPersistedApiHeartbeat(HttpHeartbeat apiHeartbeat) {
        return apiHeartbeatRepository.findById(apiHeartbeat.getId()).orElseThrow();
    }

    protected void assertPersistedApiHeartbeatToMatchAllProperties(HttpHeartbeat expectedApiHeartbeat) {
        assertApiHeartbeatAllPropertiesEquals(expectedApiHeartbeat, getPersistedApiHeartbeat(expectedApiHeartbeat));
    }

    protected void assertPersistedApiHeartbeatToMatchUpdatableProperties(HttpHeartbeat expectedApiHeartbeat) {
        assertApiHeartbeatAllUpdatablePropertiesEquals(expectedApiHeartbeat, getPersistedApiHeartbeat(expectedApiHeartbeat));
    }
}
