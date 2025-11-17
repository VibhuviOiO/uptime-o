package uptime.observability.service;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptime.observability.domain.Branding;
import uptime.observability.repository.BrandingRepository;
import uptime.observability.service.dto.BrandingDTO;
import uptime.observability.service.mapper.BrandingMapper;

/**
 * Service Implementation for managing {@link uptime.observability.domain.Branding}.
 */
@Service
@Transactional
public class BrandingService {

    @Value("${application.branding.enabled:false}")
    private boolean brandingEnabled;

    private static final Logger LOG = LoggerFactory.getLogger(BrandingService.class);

    private final BrandingRepository brandingRepository;
    private final BrandingMapper brandingMapper;

    public BrandingService(BrandingRepository brandingRepository, BrandingMapper brandingMapper) {
        this.brandingRepository = brandingRepository;
        this.brandingMapper = brandingMapper;
    }

    /**
     * Save a branding.
     *
     * @param brandingDTO the entity to save.
     * @return the persisted entity.
     */
    public BrandingDTO save(BrandingDTO brandingDTO) {
        LOG.debug("Request to save Branding : {}", brandingDTO);
        
        // If setting as active, deactivate others
        if (brandingDTO.getIsActive()) {
            brandingRepository.findAll().forEach(branding -> {
                branding.setIsActive(false);
                brandingRepository.save(branding);
            });
        }
        
        Branding branding = brandingMapper.toEntity(brandingDTO);
        branding = brandingRepository.save(branding);
        return brandingMapper.toDto(branding);
    }

    /**
     * Update a branding.
     *
     * @param brandingDTO the entity to save.
     * @return the persisted entity.
     */
    public BrandingDTO update(BrandingDTO brandingDTO) {
        LOG.debug("Request to update Branding : {}", brandingDTO);
        return save(brandingDTO);
    }

    /**
     * Get all the brandings.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<BrandingDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Brandings");
        return brandingRepository.findAll(pageable).map(brandingMapper::toDto);
    }

    /**
     * Get one branding by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<BrandingDTO> findOne(Long id) {
        LOG.debug("Request to get Branding : {}", id);
        return brandingRepository.findById(id).map(brandingMapper::toDto);
    }

    /**
     * Get active branding configuration.
     *
     * @return the active branding entity.
     */
    @Transactional(readOnly = true)
    public Optional<BrandingDTO> findActive() {
        LOG.debug("Request to get active Branding");
        if (!brandingEnabled) {
            return Optional.empty();
        }
        return brandingRepository.findFirstByIsActiveTrue().map(brandingMapper::toDto);
    }

    /**
     * Delete the branding by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Branding : {}", id);
        brandingRepository.deleteById(id);
    }
}