package com.sportbooking.module.venue.repository;

import com.sportbooking.module.venue.entity.Venue;
import com.sportbooking.module.venue.entity.VenueStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VenueRepository extends JpaRepository<Venue, Long> {

    List<Venue> findByStatus(VenueStatus status);

    Optional<Venue> findByIdAndStatus(Long id, VenueStatus status);

    @Query("""
            SELECT venue
            FROM Venue venue
            WHERE venue.status = :status
            """)
    Page<Venue> findPublicVenues(
            @Param("status") VenueStatus status,
            Pageable pageable
    );

    @Query("""
            SELECT venue
            FROM Venue venue
            WHERE venue.status = :status
                AND (
                    LOWER(venue.name) LIKE :keywordPattern
                    OR LOWER(venue.address) LIKE :keywordPattern
                )
            """)
    Page<Venue> searchPublicVenues(
            @Param("status") VenueStatus status,
            @Param("keywordPattern") String keywordPattern,
            Pageable pageable
    );

    List<Venue> findByVendorId(Long vendorId);

    List<Venue> findByVendorIdAndStatus(Long vendorId, VenueStatus status);
}
