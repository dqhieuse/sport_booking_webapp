package com.sportbooking.module.auth.service.storage;

import com.sportbooking.common.exception.InvalidRequestException;
import com.sportbooking.config.StorageProperties;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocalAvatarStorageService implements AvatarStorageService {

    private static final String AVATAR_DIRECTORY = "avatars";
    private static final String UPLOAD_URL_PREFIX = "/uploads/avatars/";

    private final StorageProperties storageProperties;

    @Override
    public String storeAvatar(MultipartFile file) {
        validate(file);

        Path avatarDirectory = avatarDirectory();
        String filename = UUID.randomUUID() + extensionFor(file.getContentType());
        Path targetFile = avatarDirectory.resolve(filename).normalize();

        try {
            Files.createDirectories(avatarDirectory);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException exception) {
            throw new InvalidRequestException("Could not store avatar image");
        }

        return publicAvatarUrl(filename);
    }

    @Override
    public void deleteAvatarIfManaged(String avatarUrl) {
        String filename = managedFilename(avatarUrl);
        if (!StringUtils.hasText(filename)) {
            return;
        }

        Path avatarFile = avatarDirectory().resolve(filename).normalize();
        if (!avatarFile.startsWith(avatarDirectory())) {
            return;
        }

        try {
            Files.deleteIfExists(avatarFile);
        } catch (IOException exception) {
            log.warn("Could not delete old avatar file {}", avatarFile, exception);
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException("Avatar image is required");
        }

        String contentType = file.getContentType();
        if (!storageProperties.getAvatar().getAllowedContentTypes().contains(contentType)) {
            throw new InvalidRequestException("Avatar image must be JPEG, PNG, or WebP");
        }

        if (file.getSize() > storageProperties.getAvatar().getMaxFileSize().toBytes()) {
            throw new InvalidRequestException("Avatar image must be at most 2MB");
        }
    }

    private Path avatarDirectory() {
        return storageProperties.getLocal()
                .uploadDirPath()
                .toAbsolutePath()
                .normalize()
                .resolve(AVATAR_DIRECTORY)
                .normalize();
    }

    private String publicAvatarUrl(String filename) {
        String baseUrl = storageProperties.getPublicBaseUrl();
        String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        return normalizedBaseUrl + UPLOAD_URL_PREFIX + filename;
    }

    private String managedFilename(String avatarUrl) {
        if (!StringUtils.hasText(avatarUrl)) {
            return null;
        }

        String expectedPrefix = publicAvatarUrl("");
        if (!avatarUrl.startsWith(expectedPrefix)) {
            return null;
        }

        String filename = avatarUrl.substring(expectedPrefix.length());
        return filename.contains("/") || filename.contains("\\") ? null : filename;
    }

    private String extensionFor(String contentType) {
        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new InvalidRequestException("Avatar image must be JPEG, PNG, or WebP");
        };
    }
}
