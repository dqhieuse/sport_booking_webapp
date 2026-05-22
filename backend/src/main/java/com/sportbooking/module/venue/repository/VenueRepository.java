package com.sportbooking.module.venue.repository;

import com.sportbooking.module.venue.entity.Venue;
import com.sportbooking.module.venue.entity.VenueStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VenueRepository extends JpaRepository<Venue, Long> {

    List<Venue> findByStatus(VenueStatus status);

    List<Venue> findByVendorId(Long vendorId);

    List<Venue> findByVendorIdAndStatus(Long vendorId, VenueStatus status);
}
