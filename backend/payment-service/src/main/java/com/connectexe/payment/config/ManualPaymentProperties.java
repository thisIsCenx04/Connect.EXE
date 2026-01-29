package com.connectexe.payment.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "payment.manual")
public class ManualPaymentProperties {
    private String qrImageUrl;
    private String bankName;
    private String bankAccountName;
    private String bankAccountNumber;
    private String bankBranch;
    private String transferNotePrefix;

    public String getQrImageUrl() {
        return qrImageUrl;
    }

    public void setQrImageUrl(String qrImageUrl) {
        this.qrImageUrl = qrImageUrl;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getBankAccountName() {
        return bankAccountName;
    }

    public void setBankAccountName(String bankAccountName) {
        this.bankAccountName = bankAccountName;
    }

    public String getBankAccountNumber() {
        return bankAccountNumber;
    }

    public void setBankAccountNumber(String bankAccountNumber) {
        this.bankAccountNumber = bankAccountNumber;
    }

    public String getBankBranch() {
        return bankBranch;
    }

    public void setBankBranch(String bankBranch) {
        this.bankBranch = bankBranch;
    }

    public String getTransferNotePrefix() {
        return transferNotePrefix;
    }

    public void setTransferNotePrefix(String transferNotePrefix) {
        this.transferNotePrefix = transferNotePrefix;
    }
}
