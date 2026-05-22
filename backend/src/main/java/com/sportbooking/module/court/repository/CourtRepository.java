package com.sportbooking.module.court.repository;

import com.sportbooking.module.court.entity.Court;
import com.sportbooking.module.court.entity.CourtStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourtRepository extends JpaRepository<Court, Long> {

    List<Court> findByStatus(CourtStatus status);

    List<Court> findBySportIdAndStatus(Long sportId, CourtStatus status);

    List<Court> findByVenueIdAndStatus(Long venueId, CourtStatus status);
}
