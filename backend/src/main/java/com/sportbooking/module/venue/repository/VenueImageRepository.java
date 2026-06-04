package com.sportbooking.module.venue.repository;

import com.sportbooking.module.venue.entity.VenueImage;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface VenueImageRepository extends JpaRepository<VenueImage, Long> {

    List<VenueImage> findByVenueIdOrderBySortOrderAsc(Long venueId);

    List<VenueImage> findByVenueIdAndSortOrderGreaterThanEqualOrderBySortOrderDesc(Long venueId, Integer sortOrder);

    Optional<VenueImage> findByVenueIdAndPrimaryTrue(Long venueId);

    boolean existsByVenueIdAndSortOrder(Long venueId, Integer sortOrder);

    long countByVenueId(Long venueId);

    @Query("select coalesce(max(image.sortOrder), 0) from VenueImage image where image.venue.id = :venueId")
    int findMaxSortOrderByVenueId(Long venueId);
}
