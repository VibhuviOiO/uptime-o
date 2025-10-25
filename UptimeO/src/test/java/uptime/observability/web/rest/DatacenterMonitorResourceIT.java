package uptime.observability.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static uptime.observability.domain.DatacenterMonitorAsserts.*;
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
import uptime.observability.domain.DatacenterMonitor;
import uptime.observability.repository.DatacenterMonitorRepository;
import uptime.observability.service.dto.DatacenterMonitorDTO;
import uptime.observability.service.mapper.DatacenterMonitorMapper;

/**
 * Integration tests for the {@link DatacenterMonitorResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class DatacenterMonitorResourceIT {

    private static final String ENTITY_API_URL = "/api/datacenter-monitors";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private DatacenterMonitorRepository datacenterMonitorRepository;

    @Autowired
    private DatacenterMonitorMapper datacenterMonitorMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restDatacenterMonitorMockMvc;

    private DatacenterMonitor datacenterMonitor;

    private DatacenterMonitor insertedDatacenterMonitor;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DatacenterMonitor createEntity() {
        return new DatacenterMonitor();
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DatacenterMonitor createUpdatedEntity() {
        return new DatacenterMonitor();
    }

    @BeforeEach
    void initTest() {
        datacenterMonitor = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedDatacenterMonitor != null) {
            datacenterMonitorRepository.delete(insertedDatacenterMonitor);
            insertedDatacenterMonitor = null;
        }
    }

    @Test
    @Transactional
    void createDatacenterMonitor() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the DatacenterMonitor
        DatacenterMonitorDTO datacenterMonitorDTO = datacenterMonitorMapper.toDto(datacenterMonitor);
        var returnedDatacenterMonitorDTO = om.readValue(
            restDatacenterMonitorMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(datacenterMonitorDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            DatacenterMonitorDTO.class
        );

        // Validate the DatacenterMonitor in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedDatacenterMonitor = datacenterMonitorMapper.toEntity(returnedDatacenterMonitorDTO);
        assertDatacenterMonitorUpdatableFieldsEquals(returnedDatacenterMonitor, getPersistedDatacenterMonitor(returnedDatacenterMonitor));

        insertedDatacenterMonitor = returnedDatacenterMonitor;
    }

    @Test
    @Transactional
    void createDatacenterMonitorWithExistingId() throws Exception {
        // Create the DatacenterMonitor with an existing ID
        datacenterMonitor.setId(1L);
        DatacenterMonitorDTO datacenterMonitorDTO = datacenterMonitorMapper.toDto(datacenterMonitor);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restDatacenterMonitorMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(datacenterMonitorDTO)))
            .andExpect(status().isBadRequest());

        // Validate the DatacenterMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllDatacenterMonitors() throws Exception {
        // Initialize the database
        insertedDatacenterMonitor = datacenterMonitorRepository.saveAndFlush(datacenterMonitor);

        // Get all the datacenterMonitorList
        restDatacenterMonitorMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(datacenterMonitor.getId().intValue())));
    }

    @Test
    @Transactional
    void getDatacenterMonitor() throws Exception {
        // Initialize the database
        insertedDatacenterMonitor = datacenterMonitorRepository.saveAndFlush(datacenterMonitor);

        // Get the datacenterMonitor
        restDatacenterMonitorMockMvc
            .perform(get(ENTITY_API_URL_ID, datacenterMonitor.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(datacenterMonitor.getId().intValue()));
    }

    @Test
    @Transactional
    void getNonExistingDatacenterMonitor() throws Exception {
        // Get the datacenterMonitor
        restDatacenterMonitorMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingDatacenterMonitor() throws Exception {
        // Initialize the database
        insertedDatacenterMonitor = datacenterMonitorRepository.saveAndFlush(datacenterMonitor);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the datacenterMonitor
        DatacenterMonitor updatedDatacenterMonitor = datacenterMonitorRepository.findById(datacenterMonitor.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedDatacenterMonitor are not directly saved in db
        em.detach(updatedDatacenterMonitor);
        DatacenterMonitorDTO datacenterMonitorDTO = datacenterMonitorMapper.toDto(updatedDatacenterMonitor);

        restDatacenterMonitorMockMvc
            .perform(
                put(ENTITY_API_URL_ID, datacenterMonitorDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(datacenterMonitorDTO))
            )
            .andExpect(status().isOk());

        // Validate the DatacenterMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedDatacenterMonitorToMatchAllProperties(updatedDatacenterMonitor);
    }

    @Test
    @Transactional
    void putNonExistingDatacenterMonitor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        datacenterMonitor.setId(longCount.incrementAndGet());

        // Create the DatacenterMonitor
        DatacenterMonitorDTO datacenterMonitorDTO = datacenterMonitorMapper.toDto(datacenterMonitor);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDatacenterMonitorMockMvc
            .perform(
                put(ENTITY_API_URL_ID, datacenterMonitorDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(datacenterMonitorDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DatacenterMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchDatacenterMonitor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        datacenterMonitor.setId(longCount.incrementAndGet());

        // Create the DatacenterMonitor
        DatacenterMonitorDTO datacenterMonitorDTO = datacenterMonitorMapper.toDto(datacenterMonitor);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDatacenterMonitorMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(datacenterMonitorDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DatacenterMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamDatacenterMonitor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        datacenterMonitor.setId(longCount.incrementAndGet());

        // Create the DatacenterMonitor
        DatacenterMonitorDTO datacenterMonitorDTO = datacenterMonitorMapper.toDto(datacenterMonitor);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDatacenterMonitorMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(datacenterMonitorDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the DatacenterMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateDatacenterMonitorWithPatch() throws Exception {
        // Initialize the database
        insertedDatacenterMonitor = datacenterMonitorRepository.saveAndFlush(datacenterMonitor);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the datacenterMonitor using partial update
        DatacenterMonitor partialUpdatedDatacenterMonitor = new DatacenterMonitor();
        partialUpdatedDatacenterMonitor.setId(datacenterMonitor.getId());

        restDatacenterMonitorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDatacenterMonitor.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDatacenterMonitor))
            )
            .andExpect(status().isOk());

        // Validate the DatacenterMonitor in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDatacenterMonitorUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedDatacenterMonitor, datacenterMonitor),
            getPersistedDatacenterMonitor(datacenterMonitor)
        );
    }

    @Test
    @Transactional
    void fullUpdateDatacenterMonitorWithPatch() throws Exception {
        // Initialize the database
        insertedDatacenterMonitor = datacenterMonitorRepository.saveAndFlush(datacenterMonitor);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the datacenterMonitor using partial update
        DatacenterMonitor partialUpdatedDatacenterMonitor = new DatacenterMonitor();
        partialUpdatedDatacenterMonitor.setId(datacenterMonitor.getId());

        restDatacenterMonitorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDatacenterMonitor.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDatacenterMonitor))
            )
            .andExpect(status().isOk());

        // Validate the DatacenterMonitor in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDatacenterMonitorUpdatableFieldsEquals(
            partialUpdatedDatacenterMonitor,
            getPersistedDatacenterMonitor(partialUpdatedDatacenterMonitor)
        );
    }

    @Test
    @Transactional
    void patchNonExistingDatacenterMonitor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        datacenterMonitor.setId(longCount.incrementAndGet());

        // Create the DatacenterMonitor
        DatacenterMonitorDTO datacenterMonitorDTO = datacenterMonitorMapper.toDto(datacenterMonitor);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDatacenterMonitorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, datacenterMonitorDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(datacenterMonitorDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DatacenterMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchDatacenterMonitor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        datacenterMonitor.setId(longCount.incrementAndGet());

        // Create the DatacenterMonitor
        DatacenterMonitorDTO datacenterMonitorDTO = datacenterMonitorMapper.toDto(datacenterMonitor);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDatacenterMonitorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(datacenterMonitorDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DatacenterMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamDatacenterMonitor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        datacenterMonitor.setId(longCount.incrementAndGet());

        // Create the DatacenterMonitor
        DatacenterMonitorDTO datacenterMonitorDTO = datacenterMonitorMapper.toDto(datacenterMonitor);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDatacenterMonitorMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(datacenterMonitorDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the DatacenterMonitor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteDatacenterMonitor() throws Exception {
        // Initialize the database
        insertedDatacenterMonitor = datacenterMonitorRepository.saveAndFlush(datacenterMonitor);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the datacenterMonitor
        restDatacenterMonitorMockMvc
            .perform(delete(ENTITY_API_URL_ID, datacenterMonitor.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return datacenterMonitorRepository.count();
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

    protected DatacenterMonitor getPersistedDatacenterMonitor(DatacenterMonitor datacenterMonitor) {
        return datacenterMonitorRepository.findById(datacenterMonitor.getId()).orElseThrow();
    }

    protected void assertPersistedDatacenterMonitorToMatchAllProperties(DatacenterMonitor expectedDatacenterMonitor) {
        assertDatacenterMonitorAllPropertiesEquals(expectedDatacenterMonitor, getPersistedDatacenterMonitor(expectedDatacenterMonitor));
    }

    protected void assertPersistedDatacenterMonitorToMatchUpdatableProperties(DatacenterMonitor expectedDatacenterMonitor) {
        assertDatacenterMonitorAllUpdatablePropertiesEquals(
            expectedDatacenterMonitor,
            getPersistedDatacenterMonitor(expectedDatacenterMonitor)
        );
    }
}
