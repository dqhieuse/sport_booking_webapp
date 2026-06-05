package com.sportbooking.module.court.repository;

import com.sportbooking.module.court.entity.CourtImage;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CourtImageRepository extends JpaRepository<CourtImage, Long> {

    List<CourtImage> findByCourtIdOrderBySortOrderAsc(Long courtId);

    List<CourtImage> findByCourtIdAndSortOrderGreaterThanEqualOrderBySortOrderDesc(Long courtId, Integer sortOrder);

    List<CourtImage> findByCourtIdAndSortOrderGreaterThanOrderBySortOrderAsc(Long courtId, Integer sortOrder);

    Optional<CourtImage> findByCourtIdAndPrimaryTrue(Long courtId);

    boolean existsByCourtIdAndSortOrder(Long courtId, Integer sortOrder);

    long countByCourtId(Long courtId);

    @Query("select coalesce(max(image.sortOrder), 0) from CourtImage image where image.court.id = :courtId")
    int findMaxSortOrderByCourtId(Long courtId);
}
