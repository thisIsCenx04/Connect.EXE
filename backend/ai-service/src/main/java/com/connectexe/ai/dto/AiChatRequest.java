package com.connectexe.ai.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

public class AiChatRequest {
    @NotBlank(message = "Message is required")
    @Size(max = 4000, message = "Message is too long")
    private String message;

    @Valid
    private List<AiChatMessage> history = new ArrayList<>();

    @Valid
    private List<AiChatAttachment> attachments = new ArrayList<>();

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<AiChatMessage> getHistory() {
        return history;
    }

    public void setHistory(List<AiChatMessage> history) {
        this.history = history == null ? new ArrayList<>() : history;
    }

    public List<AiChatAttachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<AiChatAttachment> attachments) {
        this.attachments = attachments == null ? new ArrayList<>() : attachments;
    }
}
