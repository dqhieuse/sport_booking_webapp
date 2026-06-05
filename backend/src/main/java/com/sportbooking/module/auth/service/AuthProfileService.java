package com.sportbooking.module.auth.service;

import com.sportbooking.module.auth.dto.CurrentUserResponse;
import com.sportbooking.module.auth.service.storage.AvatarStorageService;
import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AuthProfileService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final AvatarStorageService avatarStorageService;

    @Transactional(readOnly = true)
    public CurrentUserResponse getCurrentUser(String authorizationHeader) {
        return CurrentUserResponse.from(currentUserService.requireCurrentUser(authorizationHeader));
    }

    @Transactional
    public CurrentUserResponse uploadCurrentUserAvatar(String authorizationHeader, MultipartFile file) {
        User user = currentUserService.requireCurrentUser(authorizationHeader);

        String oldAvatarUrl = user.getAvatarUrl();
        String newAvatarUrl = avatarStorageService.storeAvatar(file);

        try {
            user.setAvatarUrl(newAvatarUrl);
            User savedUser = userRepository.saveAndFlush(user);
            avatarStorageService.deleteAvatarIfManaged(oldAvatarUrl);
            return CurrentUserResponse.from(savedUser);
        } catch (RuntimeException exception) {
            avatarStorageService.deleteAvatarIfManaged(newAvatarUrl);
            throw exception;
        }
    }
}
