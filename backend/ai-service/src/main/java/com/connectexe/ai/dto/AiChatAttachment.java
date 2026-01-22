package com.connectexe.ai.dto;

public class AiChatAttachment {
    private String name;
    private String url;
    private String contentType;
    private Long size;

    public AiChatAttachment() {
    }

    public AiChatAttachment(String name, String url, String contentType, Long size) {
        this.name = name;
        this.url = url;
        this.contentType = contentType;
        this.size = size;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }
}
