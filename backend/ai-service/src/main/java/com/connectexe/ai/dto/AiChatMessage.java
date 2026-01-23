package com.connectexe.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AiChatMessage {
    @NotBlank(message = "Role is required")
    @Pattern(regexp = "user|assistant", message = "Role must be user or assistant")
    private String role;

    @NotBlank(message = "Content is required")
    @Size(max = 4000, message = "Content is too long")
    private String content;

    private java.util.List<AiChatAttachment> attachments = new java.util.ArrayList<>();

    public AiChatMessage() {
    }

    public AiChatMessage(String role, String content) {
        this.role = role;
        this.content = content;
    }

    public AiChatMessage(String role, String content, java.util.List<AiChatAttachment> attachments) {
        this.role = role;
        this.content = content;
        this.attachments = attachments == null ? new java.util.ArrayList<>() : attachments;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public java.util.List<AiChatAttachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(java.util.List<AiChatAttachment> attachments) {
        this.attachments = attachments == null ? new java.util.ArrayList<>() : attachments;
    }
}
