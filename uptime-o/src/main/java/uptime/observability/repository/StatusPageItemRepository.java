package uptime.observability.repository;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import uptime.observability.domain.StatusPageItem;

@Repository
public interface StatusPageItemRepository extends JpaRepository<StatusPageItem, Long> {
    List<StatusPageItem> findByStatusPageIdOrderByDisplayOrder(Long statusPageId);
    void deleteByStatusPageId(Long statusPageId);
}
