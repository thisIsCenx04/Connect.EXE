package com.connectexe.ai.service;

import com.connectexe.ai.domain.entity.AiOutput;
import com.connectexe.ai.domain.entity.AiRequest;
import com.connectexe.ai.domain.enums.AiAgentType;
import com.connectexe.ai.domain.enums.AiUsageStatus;
import com.connectexe.ai.dto.AiChatRequest;
import com.connectexe.ai.dto.AiChatResponse;
import com.connectexe.ai.dto.AiHistoryItem;
import com.connectexe.ai.dto.AiToolResponse;
import com.connectexe.ai.dto.AiChatMessage;
import com.connectexe.ai.dto.AiChatAttachment;
import com.connectexe.ai.dto.MarketAnalyzeRequest;
import com.connectexe.ai.dto.PitchdeckRequest;
import com.connectexe.ai.dto.ProjectEvaluateRequest;
import com.connectexe.ai.repository.AiOutputRepository;
import com.connectexe.ai.repository.AiRequestRepository;
import com.connectexe.ai.security.UserPrincipal;
import com.connectexe.common.exception.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AiService {

    private final AiRequestRepository aiRequestRepository;
    private final AiOutputRepository aiOutputRepository;
    private final OpenAiClient openAiClient;
    private final ObjectMapper objectMapper;

    public AiService(AiRequestRepository aiRequestRepository,
                     AiOutputRepository aiOutputRepository,
                     OpenAiClient openAiClient,
                     ObjectMapper objectMapper) {
        this.aiRequestRepository = aiRequestRepository;
        this.aiOutputRepository = aiOutputRepository;
        this.openAiClient = openAiClient;
        this.objectMapper = objectMapper;
    }

    public AiToolResponse marketAnalyze(MarketAnalyzeRequest request, UserPrincipal principal) {
        String prompt = buildMarketPrompt(request);
        return runTool(AiAgentType.MARKET_RESEARCH, prompt, request, principal);
    }

    public AiToolResponse pitchdeck(PitchdeckRequest request, UserPrincipal principal) {
        String prompt = buildPitchPrompt(request);
        return runTool(AiAgentType.PITCH_CREATOR, prompt, request, principal);
    }

    public AiToolResponse evaluateProject(ProjectEvaluateRequest request, UserPrincipal principal) {
        String prompt = buildEvaluationPrompt(request);
        return runTool(AiAgentType.IDEA_VALIDATOR, prompt, request, principal);
    }

    public AiChatResponse chat(AiChatRequest request, UserPrincipal principal) {
        String prompt = buildChatPrompt(request);
        return runChat(prompt, request, principal);
    }

    public List<AiHistoryItem> history(UserPrincipal principal, int limit) {
        if (principal == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication required");
        }
        int safeLimit = Math.min(Math.max(limit, 1), 50);
        List<AiRequest> requests = aiRequestRepository.findByUserIdOrderByCreatedAtDesc(
            principal.getUserId(),
            PageRequest.of(0, safeLimit)
        );
        if (requests.isEmpty()) {
            return List.of();
        }
        Map<UUID, AiOutput> outputs = new LinkedHashMap<>();
        aiOutputRepository.findAllById(requests.stream().map(AiRequest::getId).toList())
            .forEach(output -> outputs.put(output.getRequestId(), output));

        List<AiHistoryItem> items = new ArrayList<>();
        for (AiRequest request : requests) {
            AiOutput output = outputs.get(request.getId());
            items.add(new AiHistoryItem(
                request.getId(),
                request.getAgentType(),
                request.getStatus(),
                request.getInputText(),
                output == null ? null : output.getOutputText(),
                request.getErrorMessage(),
                defaultNumber(request.getPromptTokens()),
                defaultNumber(request.getCompletionTokens()),
                request.getCostUsd() == null ? BigDecimal.ZERO : request.getCostUsd(),
                request.getCreatedAt()
            ));
        }
        return items;
    }

    public List<AiChatMessage> chatHistory(UserPrincipal principal, int limit) {
        if (principal == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication required");
        }
        int safeLimit = Math.min(Math.max(limit, 1), 500);
        int requestLimit = (int) Math.ceil(safeLimit / 2.0);
        List<AiRequest> requests = aiRequestRepository.findByUserIdAndAgentTypeOrderByCreatedAtDesc(
            principal.getUserId(),
            AiAgentType.LEGAL_FINANCE_BASIC,
            PageRequest.of(0, requestLimit)
        );
        if (requests.isEmpty()) {
            return List.of();
        }
        Map<UUID, AiOutput> outputs = new LinkedHashMap<>();
        aiOutputRepository.findAllById(requests.stream().map(AiRequest::getId).toList())
            .forEach(output -> outputs.put(output.getRequestId(), output));

        requests.sort(Comparator.comparing(AiRequest::getCreatedAt));
        List<AiChatMessage> messages = new ArrayList<>();
        for (AiRequest request : requests) {
            String userMessage = extractChatMessage(request.getInputJson());
            if (hasText(userMessage)) {
                List<AiChatAttachment> attachments = extractChatAttachments(request.getInputJson());
                messages.add(new AiChatMessage("user", userMessage, attachments));
            }
            AiOutput output = outputs.get(request.getId());
            String assistantReply = output == null ? null : output.getOutputText();
            if (hasText(assistantReply)) {
                messages.add(new AiChatMessage("assistant", assistantReply));
            }
        }
        if (messages.size() > safeLimit) {
            return messages.subList(messages.size() - safeLimit, messages.size());
        }
        return messages;
    }

    private AiToolResponse runTool(AiAgentType agentType,
                                   String prompt,
                                   Object inputPayload,
                                   UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication required");
        }
        JsonNode inputJson = toJsonNode(inputPayload);
        AiRequest aiRequest = new AiRequest();
        aiRequest.setUserId(principal.getUserId());
        aiRequest.setAgentType(agentType);
        aiRequest.setInputText(prompt);
        aiRequest.setInputJson(inputJson);
        aiRequest = aiRequestRepository.save(aiRequest);

        try {
            OpenAiClient.OpenAiResult result = openAiClient.generateText(prompt);
            String outputText = result.text();
            Integer promptTokens = result.promptTokens();
            Integer completionTokens = result.completionTokens();
            int resolvedPromptTokens = promptTokens == null ? estimateTokens(prompt) : promptTokens;
            int resolvedCompletionTokens = completionTokens == null ? estimateTokens(outputText) : completionTokens;
            BigDecimal costUsd = BigDecimal.ZERO;

            aiRequest.setPromptTokens(resolvedPromptTokens);
            aiRequest.setCompletionTokens(resolvedCompletionTokens);
            aiRequest.setCostUsd(costUsd);
            AiRequest saved = aiRequestRepository.save(aiRequest);
            aiOutputRepository.save(new AiOutput(saved.getId(), outputText, null));

            return new AiToolResponse(
                saved.getId(),
                saved.getAgentType(),
                outputText,
                null,
                resolvedPromptTokens,
                resolvedCompletionTokens,
                costUsd,
                saved.getCreatedAt()
            );
        } catch (ApiException ex) {
            aiRequest.setStatus(AiUsageStatus.FAILED);
            aiRequest.setErrorMessage(ex.getMessage());
            aiRequestRepository.save(aiRequest);
            throw ex;
        } catch (Exception ex) {
            aiRequest.setStatus(AiUsageStatus.FAILED);
            aiRequest.setErrorMessage(ex.getMessage());
            aiRequestRepository.save(aiRequest);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "AI_REQUEST_FAILED", "AI request failed");
        }
    }

    private AiChatResponse runChat(String prompt, Object inputPayload, UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication required");
        }
        JsonNode inputJson = toJsonNode(inputPayload);
        AiRequest aiRequest = new AiRequest();
        aiRequest.setUserId(principal.getUserId());
        aiRequest.setAgentType(AiAgentType.LEGAL_FINANCE_BASIC);
        aiRequest.setInputText(prompt);
        aiRequest.setInputJson(inputJson);
        aiRequest = aiRequestRepository.save(aiRequest);

        try {
            OpenAiClient.OpenAiResult result = openAiClient.generateText(prompt);
            String outputText = result.text();
            Integer promptTokens = result.promptTokens();
            Integer completionTokens = result.completionTokens();
            int resolvedPromptTokens = promptTokens == null ? estimateTokens(prompt) : promptTokens;
            int resolvedCompletionTokens = completionTokens == null ? estimateTokens(outputText) : completionTokens;
            BigDecimal costUsd = BigDecimal.ZERO;

            aiRequest.setPromptTokens(resolvedPromptTokens);
            aiRequest.setCompletionTokens(resolvedCompletionTokens);
            aiRequest.setCostUsd(costUsd);
            AiRequest saved = aiRequestRepository.save(aiRequest);
            aiOutputRepository.save(new AiOutput(saved.getId(), outputText, null));

            return new AiChatResponse(
                saved.getId(),
                outputText,
                resolvedPromptTokens,
                resolvedCompletionTokens,
                costUsd,
                saved.getCreatedAt()
            );
        } catch (ApiException ex) {
            aiRequest.setStatus(AiUsageStatus.FAILED);
            aiRequest.setErrorMessage(ex.getMessage());
            aiRequestRepository.save(aiRequest);
            throw ex;
        } catch (Exception ex) {
            aiRequest.setStatus(AiUsageStatus.FAILED);
            aiRequest.setErrorMessage(ex.getMessage());
            aiRequestRepository.save(aiRequest);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "AI_REQUEST_FAILED", "AI request failed");
        }
    }

    private String buildMarketPrompt(MarketAnalyzeRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert startup analyst. Provide a concise market analysis with sections: ");
        sb.append("Market snapshot, Demand drivers, Competitive scan, Suggested next steps.\n");
        sb.append("Project: ").append(request.getProjectName()).append(".\n");
        if (hasText(request.getIndustry())) {
            sb.append("Industry: ").append(request.getIndustry()).append(".\n");
        }
        if (hasText(request.getRegion())) {
            sb.append("Region: ").append(request.getRegion()).append(".\n");
        }
        sb.append("Description: ").append(request.getDescription()).append(".\n");
        if (hasText(request.getTargetCustomer())) {
            sb.append("Target customer: ").append(request.getTargetCustomer()).append(".\n");
        }
        if (hasText(request.getCompetitors())) {
            sb.append("Competitors: ").append(request.getCompetitors()).append(".\n");
        }
        if (hasText(request.getDifferentiator())) {
            sb.append("Differentiator: ").append(request.getDifferentiator()).append(".\n");
        }
        if (hasText(request.getGoals())) {
            sb.append("Goals: ").append(request.getGoals()).append(".\n");
        }
        return sb.toString();
    }

    private String buildPitchPrompt(PitchdeckRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("Create a 10-slide pitchdeck outline with brief bullets per slide.\n");
        sb.append("Project: ").append(request.getProjectName()).append(".\n");
        sb.append("Problem: ").append(request.getProblem()).append(".\n");
        sb.append("Solution: ").append(request.getSolution()).append(".\n");
        if (hasText(request.getMarket())) {
            sb.append("Market: ").append(request.getMarket()).append(".\n");
        }
        if (hasText(request.getBusinessModel())) {
            sb.append("Business model: ").append(request.getBusinessModel()).append(".\n");
        }
        if (hasText(request.getTraction())) {
            sb.append("Traction: ").append(request.getTraction()).append(".\n");
        }
        if (hasText(request.getTeam())) {
            sb.append("Team: ").append(request.getTeam()).append(".\n");
        }
        if (hasText(request.getAsk())) {
            sb.append("Ask: ").append(request.getAsk()).append(".\n");
        }
        if (hasText(request.getNotes())) {
            sb.append("Notes: ").append(request.getNotes()).append(".\n");
        }
        return sb.toString();
    }

    private String buildEvaluationPrompt(ProjectEvaluateRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("Evaluate this startup. Provide strengths, risks, and 3 recommendations.\n");
        sb.append("Project: ").append(request.getProjectName()).append(".\n");
        sb.append("Summary: ").append(request.getSummary()).append(".\n");
        if (hasText(request.getStage())) {
            sb.append("Stage: ").append(request.getStage()).append(".\n");
        }
        if (hasText(request.getMetrics())) {
            sb.append("Metrics: ").append(request.getMetrics()).append(".\n");
        }
        if (hasText(request.getFundingNeed())) {
            sb.append("Funding need: ").append(request.getFundingNeed()).append(".\n");
        }
        if (hasText(request.getTeam())) {
            sb.append("Team: ").append(request.getTeam()).append(".\n");
        }
        if (hasText(request.getStrengths())) {
            sb.append("Strengths: ").append(request.getStrengths()).append(".\n");
        }
        if (hasText(request.getRisks())) {
            sb.append("Risks: ").append(request.getRisks()).append(".\n");
        }
        return sb.toString();
    }

    private String buildChatPrompt(AiChatRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are a startup AI assistant. Analyze the user's request and respond clearly.\n");
        if (request.getHistory() != null && !request.getHistory().isEmpty()) {
            for (var message : request.getHistory()) {
                if (!hasText(message.getContent())) {
                    continue;
                }
                String role = "assistant".equalsIgnoreCase(message.getRole()) ? "Assistant" : "User";
                sb.append(role).append(": ").append(message.getContent()).append("\n");
            }
        }
        appendAttachments(sb, request.getAttachments());
        sb.append("User: ").append(request.getMessage()).append("\n");
        sb.append("Assistant:");
        return sb.toString();
    }

    private int estimateTokens(String text) {
        if (!hasText(text)) {
            return 0;
        }
        return text.trim().split("\\s+").length;
    }

    private JsonNode toJsonNode(Object value) {
        if (value == null) {
            return null;
        }
        return objectMapper.valueToTree(value);
    }

    private String extractChatMessage(JsonNode inputJson) {
        if (inputJson == null) {
            return null;
        }
        String message = inputJson.path("message").asText(null);
        if (message != null) {
            return message.trim();
        }
        return null;
    }

    private List<AiChatAttachment> extractChatAttachments(JsonNode inputJson) {
        if (inputJson == null) {
            return List.of();
        }
        JsonNode attachmentsNode = inputJson.path("attachments");
        if (!attachmentsNode.isArray() || attachmentsNode.isEmpty()) {
            return List.of();
        }
        List<AiChatAttachment> attachments = new ArrayList<>();
        for (JsonNode node : attachmentsNode) {
            if (!node.isObject()) {
                continue;
            }
            String name = node.path("name").asText(null);
            String url = node.path("url").asText(null);
            String contentType = node.path("contentType").asText(null);
            Long size = node.has("size") ? node.get("size").asLong() : null;
            if (hasText(url)) {
                attachments.add(new AiChatAttachment(name, url, contentType, size));
            }
        }
        return attachments;
    }

    private void appendAttachments(StringBuilder sb, List<AiChatAttachment> attachments) {
        if (attachments == null || attachments.isEmpty()) {
            return;
        }
        sb.append("User attachments:\n");
        for (AiChatAttachment attachment : attachments) {
            if (attachment == null || !hasText(attachment.getUrl())) {
                continue;
            }
            sb.append("- ");
            if (hasText(attachment.getName())) {
                sb.append(attachment.getName());
            } else {
                sb.append("file");
            }
            if (hasText(attachment.getContentType())) {
                sb.append(" (").append(attachment.getContentType());
                if (attachment.getSize() != null) {
                    sb.append(", ").append(attachment.getSize()).append(" bytes");
                }
                sb.append(")");
            } else if (attachment.getSize() != null) {
                sb.append(" (").append(attachment.getSize()).append(" bytes)");
            }
            sb.append(": ").append(attachment.getUrl()).append("\n");
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private int defaultNumber(Integer value) {
        return value == null ? 0 : value;
    }
}
