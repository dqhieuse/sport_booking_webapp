package com.sportbooking.module.venue.repository;

import com.sportbooking.module.venue.entity.VenueImage;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VenueImageRepository extends JpaRepository<VenueImage, Long> {

    interface PrimaryImageView {

        Long getVenueId();

        String getImageUrl();
    }

    List<VenueImage> findByVenueIdOrderBySortOrderAsc(Long venueId);

    List<VenueImage> findByVenueIdAndSortOrderGreaterThanEqualOrderBySortOrderDesc(Long venueId, Integer sortOrder);

    List<VenueImage> findByVenueIdAndSortOrderGreaterThanOrderBySortOrderAsc(Long venueId, Integer sortOrder);

    Optional<VenueImage> findByVenueIdAndPrimaryTrue(Long venueId);

    @Query("""
            select image.venue.id as venueId, image.imageUrl as imageUrl
            from VenueImage image
            where image.venue.id in :venueIds
              and image.primary = true
            """)
    List<PrimaryImageView> findPrimaryImagesByVenueIdIn(@Param("venueIds") Collection<Long> venueIds);

    boolean existsByVenueIdAndSortOrder(Long venueId, Integer sortOrder);

    long countByVenueId(Long venueId);

    @Query("select coalesce(max(image.sortOrder), 0) from VenueImage image where image.venue.id = :venueId")
    int findMaxSortOrderByVenueId(Long venueId);
}
