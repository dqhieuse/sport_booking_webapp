package com.sportbooking.module.sport.service;

import com.sportbooking.common.exception.ResourceNotFoundException;
import com.sportbooking.module.sport.dto.SportResponse;
import com.sportbooking.module.sport.entity.Sport;
import com.sportbooking.module.sport.entity.SportStatus;
import com.sportbooking.module.sport.repository.SportRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicSportService {

    private final SportRepository sportRepository;

    @Transactional(readOnly = true)
    public List<SportResponse> getActiveSports() {
        return sportRepository.findByStatusOrderByNameAsc(SportStatus.ACTIVE)
                .stream()
                .map(SportResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public SportResponse getActiveSportById(Long id) {
        Sport sport = sportRepository.findByIdAndStatus(id, SportStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found"));

        return SportResponse.from(sport);
    }
}
