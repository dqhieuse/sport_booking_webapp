package com.sportbooking.module.auth.service.storage;

import com.sportbooking.common.storage.ImageStorageOptions;
import com.sportbooking.common.storage.ImageStorageService;
import com.sportbooking.config.StorageProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class LocalAvatarStorageService implements AvatarStorageService {

    private static final String AVATAR_DIRECTORY = "avatars";
    private static final String UPLOAD_URL_PREFIX = "/uploads/avatars/";

    private final StorageProperties storageProperties;
    private final ImageStorageService imageStorageService;

    @Override
    public String storeAvatar(MultipartFile file) {
        return imageStorageService.store(file, storageOptions());
    }

    @Override
    public void deleteAvatarIfManaged(String avatarUrl) {
        imageStorageService.deleteIfManaged(avatarUrl, storageOptions());
    }

    private ImageStorageOptions storageOptions() {
        return new ImageStorageOptions(
                AVATAR_DIRECTORY,
                UPLOAD_URL_PREFIX,
                storageProperties.getAvatar().getMaxFileSize(),
                storageProperties.getAvatar().getAllowedContentTypes(),
                "Avatar image is required",
                "Avatar image must be JPEG, PNG, or WebP",
                "Avatar image must be at most 2MB",
                "Could not store avatar image"
        );
    }
}
