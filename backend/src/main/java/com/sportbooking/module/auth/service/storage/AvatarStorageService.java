package com.sportbooking.module.auth.service.storage;

import org.springframework.web.multipart.MultipartFile;

public interface AvatarStorageService {

    String storeAvatar(MultipartFile file);

    void deleteAvatarIfManaged(String avatarUrl);
}
