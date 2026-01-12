package com.connectexe.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.auth")
public class AuthFlowProperties {
    private String frontendBaseUrl;
    private long verificationTokenTtlMinutes = 60 * 24;
    private long resetTokenTtlMinutes = 30;

    public String getFrontendBaseUrl() {
        return frontendBaseUrl;
    }

    public void setFrontendBaseUrl(String frontendBaseUrl) {
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public long getVerificationTokenTtlMinutes() {
        return verificationTokenTtlMinutes;
    }

    public void setVerificationTokenTtlMinutes(long verificationTokenTtlMinutes) {
        this.verificationTokenTtlMinutes = verificationTokenTtlMinutes;
    }

    public long getResetTokenTtlMinutes() {
        return resetTokenTtlMinutes;
    }

    public void setResetTokenTtlMinutes(long resetTokenTtlMinutes) {
        this.resetTokenTtlMinutes = resetTokenTtlMinutes;
    }
}
