package com.sportbooking.common.storage;

import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {

    String store(MultipartFile file, ImageStorageOptions options);

    void deleteIfManaged(String imageUrl, ImageStorageOptions options);
}
