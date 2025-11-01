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

    private static final String ENTITY_API_URL = "/api/http-heartbeats";
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
    private MockMvc restHttpHeartbeatMockMvc;

    private HttpHeartbeat apiHeartbeat;

    private HttpHeartbeat insertedHttpHeartbeat;

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
        if (insertedHttpHeartbeat != null) {
            apiHeartbeatRepository.delete(insertedHttpHeartbeat);
            insertedHttpHeartbeat = null;
        }
    }

    @Test
    @Transactional
    void createHttpHeartbeat() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the HttpHeartbeat
        HttpHeartbeatDTO apiHeartbeatDTO = apiHeartbeatMapper.toDto(apiHeartbeat);
        var returnedHttpHeartbeatDTO = om.readValue(
            restHttpHeartbeatMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(apiHeartbeatDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            HttpHeartbeatDTO.class
        );

        // Validate the HttpHeartbeat in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedHttpHeartbeat = apiHeartbeatMapper.toEntity(returnedHttpHeartbeatDTO);
        assertHttpHeartbeatUpdatableFieldsEquals(returnedHttpHeartbeat, getPersistedHttpHeartbeat(returnedHttpHeartbeat));

        insertedHttpHeartbeat = returnedHttpHeartbeat;
    }

    @Test
    @Transactional
    void createHttpHeartbeatWithExistingId() throws Exception {
        // Create the HttpHeartbeat with an existing ID
        apiHeartbeat.setId(1L);
        HttpHeartbeatDTO apiHeartbeatDTO = apiHeartbeatMapper.toDto(apiHeartbeat);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restHttpHeartbeatMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(apiHeartbeatDTO)))
            .andExpect(status().isBadRequest());

        // Validate the HttpHeartbeat in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkExecutedAtIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        apiHeartbeat.setExecutedAt(null);

        // Create the HttpHeartbeat, which fails.
        HttpHeartbeatDTO apiHeartbeatDTO = apiHeartbeatMapper.toDto(apiHeartbeat);

        restHttpHeartbeatMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(apiHeartbeatDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllHttpHeartbeats() throws Exception {
        // Initialize the database
        insertedHttpHeartbeat = apiHeartbeatRepository.saveAndFlush(apiHeartbeat);

        // Get all the apiHeartbeatList
        restHttpHeartbeatMockMvc
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
    void getHttpHeartbeat() throws Exception {
        // Initialize the database
        insertedHttpHeartbeat = apiHeartbeatRepository.saveAndFlush(apiHeartbeat);

        // Get the apiHeartbeat
        restHttpHeartbeatMockMvc
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
    void getNonExistingHttpHeartbeat() throws Exception {
        // Get the apiHeartbeat
        restHttpHeartbeatMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingHttpHeartbeat() throws Exception {
        // Initialize the database
        insertedHttpHeartbeat = apiHeartbeatRepository.saveAndFlush(apiHeartbeat);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the apiHeartbeat
        HttpHeartbeat updatedHttpHeartbeat = apiHeartbeatRepository.findById(apiHeartbeat.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedHttpHeartbeat are not directly saved in db
        em.detach(updatedHttpHeartbeat);
        updatedHttpHeartbeat
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
        HttpHeartbeatDTO apiHeartbeatDTO = apiHeartbeatMapper.toDto(updatedHttpHeartbeat);

        restHttpHeartbeatMockMvc
            .perform(
                put(ENTITY_API_URL_ID, apiHeartbeatDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(apiHeartbeatDTO))
            )
            .andExpect(status().isOk());

        // Validate the HttpHeartbeat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedHttpHeartbeatToMatchAllProperties(updatedHttpHeartbeat);
    }

    @Test
    @Transactional
    void putNonExistingHttpHeartbeat() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiHeartbeat.setId(longCount.incrementAndGet());

        // Create the HttpHeartbeat
        HttpHeartbeatDTO apiHeartbeatDTO = apiHeartbeatMapper.toDto(apiHeartbeat);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restHttpHeartbeatMockMvc
            .perform(
                put(ENTITY_API_URL_ID, apiHeartbeatDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(apiHeartbeatDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HttpHeartbeat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchHttpHeartbeat() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiHeartbeat.setId(longCount.incrementAndGet());

        // Create the HttpHeartbeat
        HttpHeartbeatDTO apiHeartbeatDTO = apiHeartbeatMapper.toDto(apiHeartbeat);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHttpHeartbeatMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(apiHeartbeatDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HttpHeartbeat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamHttpHeartbeat() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiHeartbeat.setId(longCount.incrementAndGet());

        // Create the HttpHeartbeat
        HttpHeartbeatDTO apiHeartbeatDTO = apiHeartbeatMapper.toDto(apiHeartbeat);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHttpHeartbeatMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(apiHeartbeatDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the HttpHeartbeat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateHttpHeartbeatWithPatch() throws Exception {
        // Initialize the database
        insertedHttpHeartbeat = apiHeartbeatRepository.saveAndFlush(apiHeartbeat);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the apiHeartbeat using partial update
        HttpHeartbeat partialUpdatedHttpHeartbeat = new HttpHeartbeat();
        partialUpdatedHttpHeartbeat.setId(apiHeartbeat.getId());

        partialUpdatedHttpHeartbeat
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

        restHttpHeartbeatMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedHttpHeartbeat.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedHttpHeartbeat))
            )
            .andExpect(status().isOk());

        // Validate the HttpHeartbeat in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertHttpHeartbeatUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedHttpHeartbeat, apiHeartbeat),
            getPersistedHttpHeartbeat(apiHeartbeat)
        );
    }

    @Test
    @Transactional
    void fullUpdateHttpHeartbeatWithPatch() throws Exception {
        // Initialize the database
        insertedHttpHeartbeat = apiHeartbeatRepository.saveAndFlush(apiHeartbeat);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the apiHeartbeat using partial update
        HttpHeartbeat partialUpdatedHttpHeartbeat = new HttpHeartbeat();
        partialUpdatedHttpHeartbeat.setId(apiHeartbeat.getId());

        partialUpdatedHttpHeartbeat
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

        restHttpHeartbeatMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedHttpHeartbeat.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedHttpHeartbeat))
            )
            .andExpect(status().isOk());

        // Validate the HttpHeartbeat in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertHttpHeartbeatUpdatableFieldsEquals(partialUpdatedHttpHeartbeat, getPersistedHttpHeartbeat(partialUpdatedHttpHeartbeat));
    }

    @Test
    @Transactional
    void patchNonExistingHttpHeartbeat() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiHeartbeat.setId(longCount.incrementAndGet());

        // Create the HttpHeartbeat
        HttpHeartbeatDTO apiHeartbeatDTO = apiHeartbeatMapper.toDto(apiHeartbeat);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restHttpHeartbeatMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, apiHeartbeatDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(apiHeartbeatDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HttpHeartbeat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchHttpHeartbeat() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiHeartbeat.setId(longCount.incrementAndGet());

        // Create the HttpHeartbeat
        HttpHeartbeatDTO apiHeartbeatDTO = apiHeartbeatMapper.toDto(apiHeartbeat);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHttpHeartbeatMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(apiHeartbeatDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HttpHeartbeat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamHttpHeartbeat() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        apiHeartbeat.setId(longCount.incrementAndGet());

        // Create the HttpHeartbeat
        HttpHeartbeatDTO apiHeartbeatDTO = apiHeartbeatMapper.toDto(apiHeartbeat);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHttpHeartbeatMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(apiHeartbeatDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the HttpHeartbeat in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteHttpHeartbeat() throws Exception {
        // Initialize the database
        insertedHttpHeartbeat = apiHeartbeatRepository.saveAndFlush(apiHeartbeat);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the apiHeartbeat
        restHttpHeartbeatMockMvc
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

    protected HttpHeartbeat getPersistedHttpHeartbeat(HttpHeartbeat apiHeartbeat) {
        return apiHeartbeatRepository.findById(apiHeartbeat.getId()).orElseThrow();
    }

    protected void assertPersistedHttpHeartbeatToMatchAllProperties(HttpHeartbeat expectedHttpHeartbeat) {
        assertHttpHeartbeatAllPropertiesEquals(expectedHttpHeartbeat, getPersistedHttpHeartbeat(expectedHttpHeartbeat));
    }

    protected void assertPersistedHttpHeartbeatToMatchUpdatableProperties(HttpHeartbeat expectedHttpHeartbeat) {
        assertHttpHeartbeatAllUpdatablePropertiesEquals(expectedHttpHeartbeat, getPersistedHttpHeartbeat(expectedHttpHeartbeat));
    }
}
