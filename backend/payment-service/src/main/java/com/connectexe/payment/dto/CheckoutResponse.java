package com.connectexe.payment.dto;

public class CheckoutResponse {
    private String orderCode;
    private long amountVnd;
    private String transferContent;
    private String qrImageUrl;
    private String bankName;
    private String bankAccountName;
    private String bankAccountNumber;
    private String bankBranch;

    public CheckoutResponse(String orderCode,
                            long amountVnd,
                            String transferContent,
                            String qrImageUrl,
                            String bankName,
                            String bankAccountName,
                            String bankAccountNumber,
                            String bankBranch) {
        this.orderCode = orderCode;
        this.amountVnd = amountVnd;
        this.transferContent = transferContent;
        this.qrImageUrl = qrImageUrl;
        this.bankName = bankName;
        this.bankAccountName = bankAccountName;
        this.bankAccountNumber = bankAccountNumber;
        this.bankBranch = bankBranch;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public long getAmountVnd() {
        return amountVnd;
    }

    public String getTransferContent() {
        return transferContent;
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
}
