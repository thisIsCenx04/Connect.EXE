package com.connectexe.payment.dto;

public class ManualPaymentInfoResponse {
    private String qrImageUrl;
    private String bankName;
    private String bankAccountName;
    private String bankAccountNumber;
    private String bankBranch;
    private String transferNotePrefix;

    public ManualPaymentInfoResponse(String qrImageUrl,
                                     String bankName,
                                     String bankAccountName,
                                     String bankAccountNumber,
                                     String bankBranch,
                                     String transferNotePrefix) {
        this.qrImageUrl = qrImageUrl;
        this.bankName = bankName;
        this.bankAccountName = bankAccountName;
        this.bankAccountNumber = bankAccountNumber;
        this.bankBranch = bankBranch;
        this.transferNotePrefix = transferNotePrefix;
    }

    public String getQrImageUrl() {
        return qrImageUrl;
    }

    public String getBankName() {
        return bankName;
    }

    public String getBankAccountName() {
        return bankAccountName;
    }

    public String getBankAccountNumber() {
        return bankAccountNumber;
    }

    public String getBankBranch() {
        return bankBranch;
    }

    public String getTransferNotePrefix() {
        return transferNotePrefix;
    }
}
