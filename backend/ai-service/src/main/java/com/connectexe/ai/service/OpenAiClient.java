package com.connectexe.ai.service;

import com.connectexe.ai.config.OpenAiProperties;
import com.connectexe.common.exception.ApiException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class OpenAiClient {

    private final OpenAiProperties properties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public OpenAiClient(OpenAiProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
    }

    public OpenAiResult generateText(String prompt) {
        if (isBlank(prompt)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PROMPT_REQUIRED", "Prompt is required");
        }
        if (isBlank(properties.getApiKey())) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "OPENAI_NOT_CONFIGURED", "OpenAI API key is missing");
        }
        String model = isBlank(properties.getModel()) ? "gpt-4.1-mini" : properties.getModel().trim();
        String baseUrl = isBlank(properties.getBaseUrl())
            ? "https://api.openai.com/v1"
            : trimTrailingSlash(properties.getBaseUrl());

        String systemPrompt = isBlank(properties.getSystemPrompt())
            ? "You are a startup AI assistant."
            : properties.getSystemPrompt().trim();
        systemPrompt = systemPrompt.replace("\\r", "\r").replace("\\n", "\n");

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("model", model);
        payload.put("messages", List.of(
            Map.of("role", "system", "content", systemPrompt),
            Map.of("role", "user", "content", prompt)
        ));
        if (properties.getTemperature() != null) {
            payload.put("temperature", properties.getTemperature());
        }
        if (properties.getMaxOutputTokens() != null) {
            payload.put("max_tokens", properties.getMaxOutputTokens());
        }

        String body;
        try {
            body = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "OPENAI_PAYLOAD_ERROR", "Unable to build OpenAI payload");
        }

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + "/chat/completions"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + properties.getApiKey().trim())
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();

        HttpResponse<String> response;
        try {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ApiException(HttpStatus.BAD_GATEWAY, "OPENAI_UNAVAILABLE", "Unable to reach OpenAI API");
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "OPENAI_UNAVAILABLE", "Unable to reach OpenAI API");
        }

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            String errorDetail = extractErrorMessage(response.body());
            String message = errorDetail == null
                ? "OpenAI API returned an error"
                : "OpenAI API error: " + errorDetail;
            throw new ApiException(HttpStatus.BAD_GATEWAY, "OPENAI_ERROR", message);
        }

        return parseResponse(response.body());
    }

    private OpenAiResult parseResponse(String body) {
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode choices = root.path("choices");
            if (!choices.isArray() || choices.isEmpty()) {
                throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "OPENAI_EMPTY", "OpenAI returned no choices");
            }
            JsonNode message = choices.get(0).path("message");
            String text = message.path("content").asText("");
            if (text.isBlank()) {
                throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "OPENAI_EMPTY", "OpenAI returned empty output");
            }
            JsonNode usage = root.path("usage");
            Integer promptTokens = usage.has("prompt_tokens") ? usage.get("prompt_tokens").asInt() : null;
            Integer completionTokens = usage.has("completion_tokens") ? usage.get("completion_tokens").asInt() : null;
            return new OpenAiResult(text.trim(), promptTokens, completionTokens);
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "OPENAI_PARSE_ERROR", "Unable to parse OpenAI response");
        }
    }

    private String extractErrorMessage(String body) {
        if (isBlank(body)) {
            return null;
        }
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode error = root.path("error");
            if (error.isMissingNode()) {
                return null;
            }
            String message = error.path("message").asText(null);
            if (message != null && !message.isBlank()) {
                return message.trim();
            }
        } catch (IOException ex) {
            return null;
        }
        return null;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String trimTrailingSlash(String value) {
        String trimmed = value.trim();
        if (trimmed.endsWith("/")) {
            return trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }

    public record OpenAiResult(String text, Integer promptTokens, Integer completionTokens) {
    }
}
