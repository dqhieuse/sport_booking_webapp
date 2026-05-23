package com.sportbooking.module.court.repository;

import com.sportbooking.module.court.entity.Court;
import com.sportbooking.module.court.entity.CourtStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CourtRepository extends JpaRepository<Court, Long> {

    List<Court> findByStatus(CourtStatus status);

    Optional<Court> findByIdAndStatus(Long id, CourtStatus status);

    @Query("""
            SELECT court
            FROM Court court
            WHERE court.status = :status
                AND (:sportId IS NULL OR court.sport.id = :sportId)
                AND (:venueId IS NULL OR court.venue.id = :venueId)
                AND (
                    :keyword IS NULL
                    OR LOWER(court.name) LIKE CONCAT('%', :keyword, '%')
                    OR LOWER(court.venue.name) LIKE CONCAT('%', :keyword, '%')
                    OR LOWER(court.sport.name) LIKE CONCAT('%', :keyword, '%')
                )
            ORDER BY court.name ASC
            """)
    Page<Court> findPublicCourts(
            @Param("status") CourtStatus status,
            @Param("sportId") Long sportId,
            @Param("venueId") Long venueId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    List<Court> findBySportIdAndStatus(Long sportId, CourtStatus status);

    List<Court> findByVenueIdAndStatus(Long venueId, CourtStatus status);
}
