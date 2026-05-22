package com.sportbooking.module.court.repository;

import com.sportbooking.module.court.entity.CourtImage;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourtImageRepository extends JpaRepository<CourtImage, Long> {

    List<CourtImage> findByCourtIdOrderBySortOrderAsc(Long courtId);

    Optional<CourtImage> findByCourtIdAndPrimaryTrue(Long courtId);

    boolean existsByCourtIdAndSortOrder(Long courtId, Integer sortOrder);
}
