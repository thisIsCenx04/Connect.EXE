package com.connectexe.ai.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.connectexe.ai.config.CloudinaryProperties;
import com.connectexe.common.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final CloudinaryProperties properties;
    private final Cloudinary cloudinary;

    public CloudinaryService(CloudinaryProperties properties) {
        this.properties = properties;
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
            "cloud_name", properties.getCloudName(),
            "api_key", properties.getApiKey(),
            "api_secret", properties.getApiSecret(),
            "secure", true
        ));
    }

    public UploadResult upload(MultipartFile file, String subfolder) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "EMPTY_FILE", "Upload file is empty");
        }
        if (isBlank(properties.getCloudName())
            || isBlank(properties.getApiKey())
            || isBlank(properties.getApiSecret())) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "CLOUDINARY_NOT_CONFIGURED", "Cloudinary is not configured");
        }

        String folder = buildFolder(subfolder);
        Map<String, Object> options = ObjectUtils.asMap(
            "folder", folder,
            "resource_type", "auto"
        );

        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);
            String url = (String) result.get("secure_url");
            String publicId = (String) result.get("public_id");
            return new UploadResult(url, publicId);
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "UPLOAD_FAILED", "File upload failed");
        }
    }

    private String buildFolder(String subfolder) {
        String baseFolder = isBlank(properties.getFolder()) ? "connectexe" : properties.getFolder().trim();
        if (isBlank(subfolder)) {
            return baseFolder;
        }
        return baseFolder + "/" + subfolder.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    public static class UploadResult {
        private final String url;
        private final String publicId;

        public UploadResult(String url, String publicId) {
            this.url = url;
            this.publicId = publicId;
        }

        public String getUrl() {
            return url;
        }

        public String getPublicId() {
            return publicId;
        }
    }
}
