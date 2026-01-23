package com.connectexe.ai.controller;

import com.connectexe.ai.dto.AiChatAttachment;
import com.connectexe.ai.dto.AiChatMessage;
import com.connectexe.ai.dto.AiChatRequest;
import com.connectexe.ai.dto.AiChatResponse;
import com.connectexe.ai.dto.AiHistoryItem;
import com.connectexe.ai.dto.AiToolResponse;
import com.connectexe.ai.dto.MarketAnalyzeRequest;
import com.connectexe.ai.dto.PitchdeckRequest;
import com.connectexe.ai.dto.ProjectEvaluateRequest;
import com.connectexe.ai.security.UserPrincipal;
import com.connectexe.ai.service.AiService;
import com.connectexe.ai.service.CloudinaryService;
import com.connectexe.common.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;
    private final CloudinaryService cloudinaryService;

    public AiController(AiService aiService, CloudinaryService cloudinaryService) {
        this.aiService = aiService;
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/market-analyze")
    public ResponseEntity<ApiResponse<AiToolResponse>> marketAnalyze(
            @Valid @RequestBody MarketAnalyzeRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        AiToolResponse response = aiService.marketAnalyze(request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Market analysis generated", response));
    }

    @PostMapping("/pitchdeck")
    public ResponseEntity<ApiResponse<AiToolResponse>> pitchdeck(
            @Valid @RequestBody PitchdeckRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        AiToolResponse response = aiService.pitchdeck(request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Pitchdeck outline generated", response));
    }

    @PostMapping("/project-evaluate")
    public ResponseEntity<ApiResponse<AiToolResponse>> evaluateProject(
            @Valid @RequestBody ProjectEvaluateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        AiToolResponse response = aiService.evaluateProject(request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Project evaluation generated", response));
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AiChatResponse>> chat(
            @Valid @RequestBody AiChatRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        AiChatResponse response = aiService.chat(request, principal);
        return ResponseEntity.ok(ApiResponse.ok("AI chat response generated", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<AiHistoryItem>>> history(
            @RequestParam(value = "limit", defaultValue = "15") int limit,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<AiHistoryItem> items = aiService.history(principal, limit);
        return ResponseEntity.ok(ApiResponse.ok("AI history loaded", items));
    }

    @GetMapping("/chat-history")
    public ResponseEntity<ApiResponse<List<AiChatMessage>>> chatHistory(
            @RequestParam(value = "limit", defaultValue = "200") int limit,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<AiChatMessage> items = aiService.chatHistory(principal, limit);
        return ResponseEntity.ok(ApiResponse.ok("AI chat history loaded", items));
    }

    @PostMapping("/chat/upload")
    public ResponseEntity<ApiResponse<AiChatAttachment>> uploadChatAttachment(
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }
        CloudinaryService.UploadResult result = cloudinaryService.upload(file, "ai-chat");
        AiChatAttachment response = new AiChatAttachment(
            file.getOriginalFilename(),
            result.getUrl(),
            file.getContentType(),
            file.getSize()
        );
        return ResponseEntity.ok(ApiResponse.ok("AI chat file uploaded", response));
    }
}
