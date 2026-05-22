package com.sportbooking.module.venue.repository;

import com.sportbooking.module.venue.entity.VenueImage;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VenueImageRepository extends JpaRepository<VenueImage, Long> {

    List<VenueImage> findByVenueIdOrderBySortOrderAsc(Long venueId);

    Optional<VenueImage> findByVenueIdAndPrimaryTrue(Long venueId);

    boolean existsByVenueIdAndSortOrder(Long venueId, Integer sortOrder);
}
