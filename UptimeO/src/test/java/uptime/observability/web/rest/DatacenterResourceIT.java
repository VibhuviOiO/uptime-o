package uptime.observability.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static uptime.observability.domain.DatacenterAsserts.*;
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
import uptime.observability.domain.Datacenter;
import uptime.observability.repository.DatacenterRepository;
import uptime.observability.service.dto.DatacenterDTO;
import uptime.observability.service.mapper.DatacenterMapper;

/**
 * Integration tests for the {@link DatacenterResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class DatacenterResourceIT {

    private static final String DEFAULT_CODE = "AAAAAAAAAA";
    private static final String UPDATED_CODE = "BBBBBBBBBB";

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/datacenters";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private DatacenterRepository datacenterRepository;

    @Autowired
    private DatacenterMapper datacenterMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restDatacenterMockMvc;

    private Datacenter datacenter;

    private Datacenter insertedDatacenter;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Datacenter createEntity() {
        return new Datacenter().code(DEFAULT_CODE).name(DEFAULT_NAME);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Datacenter createUpdatedEntity() {
        return new Datacenter().code(UPDATED_CODE).name(UPDATED_NAME);
    }

    @BeforeEach
    void initTest() {
        datacenter = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedDatacenter != null) {
            datacenterRepository.delete(insertedDatacenter);
            insertedDatacenter = null;
        }
    }

    @Test
    @Transactional
    void createDatacenter() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Datacenter
        DatacenterDTO datacenterDTO = datacenterMapper.toDto(datacenter);
        var returnedDatacenterDTO = om.readValue(
            restDatacenterMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(datacenterDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            DatacenterDTO.class
        );

        // Validate the Datacenter in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedDatacenter = datacenterMapper.toEntity(returnedDatacenterDTO);
        assertDatacenterUpdatableFieldsEquals(returnedDatacenter, getPersistedDatacenter(returnedDatacenter));

        insertedDatacenter = returnedDatacenter;
    }

    @Test
    @Transactional
    void createDatacenterWithExistingId() throws Exception {
        // Create the Datacenter with an existing ID
        datacenter.setId(1L);
        DatacenterDTO datacenterDTO = datacenterMapper.toDto(datacenter);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restDatacenterMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(datacenterDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Datacenter in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkCodeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        datacenter.setCode(null);

        // Create the Datacenter, which fails.
        DatacenterDTO datacenterDTO = datacenterMapper.toDto(datacenter);

        restDatacenterMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(datacenterDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        datacenter.setName(null);

        // Create the Datacenter, which fails.
        DatacenterDTO datacenterDTO = datacenterMapper.toDto(datacenter);

        restDatacenterMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(datacenterDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllDatacenters() throws Exception {
        // Initialize the database
        insertedDatacenter = datacenterRepository.saveAndFlush(datacenter);

        // Get all the datacenterList
        restDatacenterMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(datacenter.getId().intValue())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)));
    }

    @Test
    @Transactional
    void getDatacenter() throws Exception {
        // Initialize the database
        insertedDatacenter = datacenterRepository.saveAndFlush(datacenter);

        // Get the datacenter
        restDatacenterMockMvc
            .perform(get(ENTITY_API_URL_ID, datacenter.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(datacenter.getId().intValue()))
            .andExpect(jsonPath("$.code").value(DEFAULT_CODE))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME));
    }

    @Test
    @Transactional
    void getNonExistingDatacenter() throws Exception {
        // Get the datacenter
        restDatacenterMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingDatacenter() throws Exception {
        // Initialize the database
        insertedDatacenter = datacenterRepository.saveAndFlush(datacenter);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the datacenter
        Datacenter updatedDatacenter = datacenterRepository.findById(datacenter.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedDatacenter are not directly saved in db
        em.detach(updatedDatacenter);
        updatedDatacenter.code(UPDATED_CODE).name(UPDATED_NAME);
        DatacenterDTO datacenterDTO = datacenterMapper.toDto(updatedDatacenter);

        restDatacenterMockMvc
            .perform(
                put(ENTITY_API_URL_ID, datacenterDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(datacenterDTO))
            )
            .andExpect(status().isOk());

        // Validate the Datacenter in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedDatacenterToMatchAllProperties(updatedDatacenter);
    }

    @Test
    @Transactional
    void putNonExistingDatacenter() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        datacenter.setId(longCount.incrementAndGet());

        // Create the Datacenter
        DatacenterDTO datacenterDTO = datacenterMapper.toDto(datacenter);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDatacenterMockMvc
            .perform(
                put(ENTITY_API_URL_ID, datacenterDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(datacenterDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Datacenter in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchDatacenter() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        datacenter.setId(longCount.incrementAndGet());

        // Create the Datacenter
        DatacenterDTO datacenterDTO = datacenterMapper.toDto(datacenter);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDatacenterMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(datacenterDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Datacenter in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamDatacenter() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        datacenter.setId(longCount.incrementAndGet());

        // Create the Datacenter
        DatacenterDTO datacenterDTO = datacenterMapper.toDto(datacenter);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDatacenterMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(datacenterDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Datacenter in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateDatacenterWithPatch() throws Exception {
        // Initialize the database
        insertedDatacenter = datacenterRepository.saveAndFlush(datacenter);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the datacenter using partial update
        Datacenter partialUpdatedDatacenter = new Datacenter();
        partialUpdatedDatacenter.setId(datacenter.getId());

        partialUpdatedDatacenter.name(UPDATED_NAME);

        restDatacenterMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDatacenter.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDatacenter))
            )
            .andExpect(status().isOk());

        // Validate the Datacenter in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDatacenterUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedDatacenter, datacenter),
            getPersistedDatacenter(datacenter)
        );
    }

    @Test
    @Transactional
    void fullUpdateDatacenterWithPatch() throws Exception {
        // Initialize the database
        insertedDatacenter = datacenterRepository.saveAndFlush(datacenter);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the datacenter using partial update
        Datacenter partialUpdatedDatacenter = new Datacenter();
        partialUpdatedDatacenter.setId(datacenter.getId());

        partialUpdatedDatacenter.code(UPDATED_CODE).name(UPDATED_NAME);

        restDatacenterMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDatacenter.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDatacenter))
            )
            .andExpect(status().isOk());

        // Validate the Datacenter in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDatacenterUpdatableFieldsEquals(partialUpdatedDatacenter, getPersistedDatacenter(partialUpdatedDatacenter));
    }

    @Test
    @Transactional
    void patchNonExistingDatacenter() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        datacenter.setId(longCount.incrementAndGet());

        // Create the Datacenter
        DatacenterDTO datacenterDTO = datacenterMapper.toDto(datacenter);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDatacenterMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, datacenterDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(datacenterDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Datacenter in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchDatacenter() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        datacenter.setId(longCount.incrementAndGet());

        // Create the Datacenter
        DatacenterDTO datacenterDTO = datacenterMapper.toDto(datacenter);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDatacenterMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(datacenterDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Datacenter in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamDatacenter() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        datacenter.setId(longCount.incrementAndGet());

        // Create the Datacenter
        DatacenterDTO datacenterDTO = datacenterMapper.toDto(datacenter);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDatacenterMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(datacenterDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Datacenter in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteDatacenter() throws Exception {
        // Initialize the database
        insertedDatacenter = datacenterRepository.saveAndFlush(datacenter);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the datacenter
        restDatacenterMockMvc
            .perform(delete(ENTITY_API_URL_ID, datacenter.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return datacenterRepository.count();
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

    protected Datacenter getPersistedDatacenter(Datacenter datacenter) {
        return datacenterRepository.findById(datacenter.getId()).orElseThrow();
    }

    protected void assertPersistedDatacenterToMatchAllProperties(Datacenter expectedDatacenter) {
        assertDatacenterAllPropertiesEquals(expectedDatacenter, getPersistedDatacenter(expectedDatacenter));
    }

    protected void assertPersistedDatacenterToMatchUpdatableProperties(Datacenter expectedDatacenter) {
        assertDatacenterAllUpdatablePropertiesEquals(expectedDatacenter, getPersistedDatacenter(expectedDatacenter));
    }
}
