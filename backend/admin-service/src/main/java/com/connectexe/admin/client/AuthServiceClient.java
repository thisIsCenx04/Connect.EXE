package com.connectexe.admin.client;

import com.connectexe.admin.dto.AdminUserStatusRequest;
import com.connectexe.admin.dto.AdminUserSummary;
import com.connectexe.common.dto.ApiResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class AuthServiceClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String authServiceUrl;

    public AuthServiceClient(
            @Value("${app.auth-service.url:http://auth-service:8081}") String authServiceUrl) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.objectMapper.findAndRegisterModules(); // Register Java 8 date/time modules
        this.authServiceUrl = authServiceUrl;
    }

    public List<AdminUserSummary> listUsers(String query, Boolean active, String token) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(authServiceUrl + "/api/admin/users");
        if (query != null && !query.isBlank()) {
            builder.queryParam("query", query);
        }
        if (active != null) {
            builder.queryParam("active", active);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
            builder.toUriString(),
            HttpMethod.GET,
            entity,
            Map.class
        );

        Map<String, Object> body = response.getBody();
        if (body == null || body.get("data") == null) {
            return List.of();
        }
        
        return objectMapper.convertValue(
            body.get("data"),
            new TypeReference<List<AdminUserSummary>>() {}
        );
    }

    public AdminUserSummary updateUserStatus(UUID userId, AdminUserStatusRequest request, String token) {
        String url = authServiceUrl + "/api/admin/users/" + userId + "/status";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<AdminUserStatusRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
            url,
            HttpMethod.PATCH,
            entity,
            Map.class
        );

        Map<String, Object> body = response.getBody();
        if (body == null || body.get("data") == null) {
            return null;
        }
        
        return objectMapper.convertValue(body.get("data"), AdminUserSummary.class);
    }

    public Map<String, Long> getUserStats(String token) {
        String url = authServiceUrl + "/api/admin/users/stats";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            entity,
            Map.class
        );

        Map<String, Object> body = response.getBody();
        if (body == null || body.get("data") == null) {
            return Map.of();
        }
        
        return objectMapper.convertValue(
            body.get("data"),
            new TypeReference<Map<String, Long>>() {}
        );
    }
}
