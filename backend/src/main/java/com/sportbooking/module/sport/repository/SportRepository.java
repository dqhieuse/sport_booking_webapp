package com.sportbooking.module.sport.repository;

import com.sportbooking.module.sport.entity.Sport;
import com.sportbooking.module.sport.entity.SportStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SportRepository extends JpaRepository<Sport, Long> {

    List<Sport> findByStatus(SportStatus status);

    Optional<Sport> findByName(String name);

    boolean existsByName(String name);
}
