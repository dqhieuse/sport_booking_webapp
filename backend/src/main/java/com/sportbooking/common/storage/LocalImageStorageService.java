package com.sportbooking.common.storage;

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
public class LocalImageStorageService implements ImageStorageService {

    private final StorageProperties storageProperties;

    @Override
    public String store(MultipartFile file, ImageStorageOptions options) {
        validate(file, options);

        Path imageDirectory = imageDirectory(options);
        String filename = UUID.randomUUID() + extensionFor(file.getContentType(), options.invalidTypeMessage());
        Path targetFile = imageDirectory.resolve(filename).normalize();

        try {
            Files.createDirectories(imageDirectory);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException exception) {
            throw new InvalidRequestException(options.storageFailureMessage());
        }

        return publicImageUrl(filename, options);
    }

    @Override
    public void deleteIfManaged(String imageUrl, ImageStorageOptions options) {
        String filename = managedFilename(imageUrl, options);
        if (!StringUtils.hasText(filename)) {
            return;
        }

        Path imageDirectory = imageDirectory(options);
        Path imageFile = imageDirectory.resolve(filename).normalize();
        if (!imageFile.startsWith(imageDirectory)) {
            return;
        }

        try {
            Files.deleteIfExists(imageFile);
        } catch (IOException exception) {
            log.warn("Could not delete managed image file {}", imageFile, exception);
        }
    }

    private void validate(MultipartFile file, ImageStorageOptions options) {
        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException(options.requiredMessage());
        }

        String contentType = file.getContentType();
        if (!options.allowedContentTypes().contains(contentType)) {
            throw new InvalidRequestException(options.invalidTypeMessage());
        }

        if (file.getSize() > options.maxFileSize().toBytes()) {
            throw new InvalidRequestException(options.maxSizeMessage());
        }
    }

    private Path imageDirectory(ImageStorageOptions options) {
        return storageProperties.getLocal()
                .uploadDirPath()
                .toAbsolutePath()
                .normalize()
                .resolve(options.directory())
                .normalize();
    }

    private String publicImageUrl(String filename, ImageStorageOptions options) {
        String baseUrl = storageProperties.getPublicBaseUrl();
        String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        return normalizedBaseUrl + options.uploadUrlPrefix() + filename;
    }

    private String managedFilename(String imageUrl, ImageStorageOptions options) {
        if (!StringUtils.hasText(imageUrl)) {
            return null;
        }

        String expectedPrefix = publicImageUrl("", options);
        if (!imageUrl.startsWith(expectedPrefix)) {
            return null;
        }

        String filename = imageUrl.substring(expectedPrefix.length());
        return filename.contains("/") || filename.contains("\\") ? null : filename;
    }

    private String extensionFor(String contentType, String invalidTypeMessage) {
        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new InvalidRequestException(invalidTypeMessage);
        };
    }
}
