package com.sportbooking.common.storage;

import java.util.List;
import org.springframework.util.unit.DataSize;

public record ImageStorageOptions(
        String directory,
        String uploadUrlPrefix,
        DataSize maxFileSize,
        List<String> allowedContentTypes,
        String requiredMessage,
        String invalidTypeMessage,
        String maxSizeMessage,
        String storageFailureMessage
) {
}
