package com.sportbooking.module.court.repository;

import com.sportbooking.module.court.entity.Court;
import com.sportbooking.module.court.entity.CourtStatus;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CourtRepository extends JpaRepository<Court, Long> {

    interface VenueCourtCountView {

        Long getVenueId();

        long getCourtCount();
    }

    @Override
    @EntityGraph(attributePaths = {"sport", "venue", "venue.vendor"})
    Optional<Court> findById(Long id);

    List<Court> findByStatus(CourtStatus status);

    @EntityGraph(attributePaths = {"sport", "venue"})
    Optional<Court> findByIdAndStatus(Long id, CourtStatus status);

    boolean existsByIdAndStatus(Long id, CourtStatus status);

    @EntityGraph(attributePaths = {"sport", "venue"})
    @Query("""
            SELECT court
            FROM Court court
            WHERE court.status = :status
                AND (:sportId IS NULL OR court.sport.id = :sportId)
                AND (:venueId IS NULL OR court.venue.id = :venueId)
            """)
    Page<Court> findPublicCourts(
            @Param("status") CourtStatus status,
            @Param("sportId") Long sportId,
            @Param("venueId") Long venueId,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"sport", "venue"})
    @Query("""
            SELECT court
            FROM Court court
            WHERE court.status = :status
                AND (:sportId IS NULL OR court.sport.id = :sportId)
                AND (:venueId IS NULL OR court.venue.id = :venueId)
                AND (
                    LOWER(court.name) LIKE :keywordPattern
                    OR LOWER(court.venue.name) LIKE :keywordPattern
                    OR LOWER(court.sport.name) LIKE :keywordPattern
                )
            """)
    Page<Court> searchPublicCourts(
            @Param("status") CourtStatus status,
            @Param("sportId") Long sportId,
            @Param("venueId") Long venueId,
            @Param("keywordPattern") String keywordPattern,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"sport", "venue"})
    @Query("""
            SELECT court
            FROM Court court
            WHERE court.venue.vendor.id = :vendorId
                AND (:venueId IS NULL OR court.venue.id = :venueId)
                AND (:sportId IS NULL OR court.sport.id = :sportId)
                AND (:status IS NULL OR court.status = :status)
            """)
    Page<Court> findVendorCourts(
            @Param("vendorId") Long vendorId,
            @Param("venueId") Long venueId,
            @Param("sportId") Long sportId,
            @Param("status") CourtStatus status,
            Pageable pageable
    );

    List<Court> findBySportIdAndStatus(Long sportId, CourtStatus status);

    List<Court> findByVenueIdAndStatus(Long venueId, CourtStatus status);

    long countByVenueId(Long venueId);

    @Query("""
            select court.venue.id as venueId, count(court.id) as courtCount
            from Court court
            where court.venue.id in :venueIds
            group by court.venue.id
            """)
    List<VenueCourtCountView> countByVenueIdIn(@Param("venueIds") Collection<Long> venueIds);
}
