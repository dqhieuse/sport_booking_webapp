package com.sportbooking.module.court.repository;

import com.sportbooking.module.court.entity.CourtImage;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CourtImageRepository extends JpaRepository<CourtImage, Long> {

    interface PrimaryImageView {

        Long getCourtId();

        String getImageUrl();
    }

    List<CourtImage> findByCourtIdOrderBySortOrderAsc(Long courtId);

    List<CourtImage> findByCourtIdAndSortOrderGreaterThanEqualOrderBySortOrderDesc(Long courtId, Integer sortOrder);

    List<CourtImage> findByCourtIdAndSortOrderGreaterThanOrderBySortOrderAsc(Long courtId, Integer sortOrder);

    Optional<CourtImage> findByCourtIdAndPrimaryTrue(Long courtId);

    @Query("""
            select image.court.id as courtId, image.imageUrl as imageUrl
            from CourtImage image
            where image.court.id in :courtIds
              and image.primary = true
            """)
    List<PrimaryImageView> findPrimaryImagesByCourtIdIn(@Param("courtIds") Collection<Long> courtIds);

    boolean existsByCourtIdAndSortOrder(Long courtId, Integer sortOrder);

    long countByCourtId(Long courtId);

    @Query("select coalesce(max(image.sortOrder), 0) from CourtImage image where image.court.id = :courtId")
    int findMaxSortOrderByCourtId(Long courtId);
}
