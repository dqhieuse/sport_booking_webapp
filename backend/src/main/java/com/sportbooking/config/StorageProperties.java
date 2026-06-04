package com.sportbooking.config;

import java.nio.file.Path;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {

    private String provider = "local";

    private String publicBaseUrl = "http://localhost:8080";

    private Local local = new Local();

    private Avatar avatar = new Avatar();

    private VenueImage venueImage = new VenueImage();

    @Getter
    @Setter
    public static class Local {
        private String uploadDir = "../sport-booking-uploads";

        public Path uploadDirPath() {
            return Path.of(uploadDir);
        }
    }

    @Getter
    @Setter
    public static class Avatar {
        private DataSize maxFileSize = DataSize.ofMegabytes(2);

        private List<String> allowedContentTypes = List.of("image/jpeg", "image/png", "image/webp");
    }

    @Getter
    @Setter
    public static class VenueImage {
        private DataSize maxFileSize = DataSize.ofMegabytes(5);

        private int maxImages = 10;

        private List<String> allowedContentTypes = List.of("image/jpeg", "image/png", "image/webp");
    }
}
