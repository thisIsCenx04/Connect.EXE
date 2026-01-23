package com.connectexe.payment.dto;

public class CheckoutResponse {
    private String orderCode;
    private String payUrl;

    public CheckoutResponse(String orderCode, String payUrl) {
        this.orderCode = orderCode;
        this.payUrl = payUrl;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public String getPayUrl() {
        return payUrl;
    }
}
