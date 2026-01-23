package com.connectexe.payment.service;

import com.connectexe.common.exception.ApiException;
import com.connectexe.payment.config.MomoProperties;
import com.connectexe.payment.config.VnpayProperties;
import com.connectexe.payment.domain.entity.PaymentOrder;
import com.connectexe.payment.domain.enums.PaymentProvider;
import com.connectexe.payment.domain.enums.PaymentStatus;
import com.connectexe.payment.domain.enums.PlanCode;
import com.connectexe.payment.dto.CheckoutResponse;
import com.connectexe.payment.repository.PaymentOrderRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private static final Map<Integer, Long> PREMIUM_PRICING_VND = Map.of(
        1, 29000L,
        3, 75000L,
        6, 145000L,
        12, 250000L
    );

    private final PaymentOrderRepository paymentOrderRepository;
    private final BillingService billingService;
    private final VnpayProperties vnpayProperties;
    private final MomoProperties momoProperties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public PaymentService(PaymentOrderRepository paymentOrderRepository,
                          BillingService billingService,
                          VnpayProperties vnpayProperties,
                          MomoProperties momoProperties,
                          ObjectMapper objectMapper) {
        this.paymentOrderRepository = paymentOrderRepository;
        this.billingService = billingService;
        this.vnpayProperties = vnpayProperties;
        this.momoProperties = momoProperties;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
    }

    public CheckoutResponse createCheckout(UUID userId,
                                           PlanCode planCode,
                                           Integer durationMonths,
                                           PaymentProvider provider,
                                           String clientIp) {
        if (provider == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PROVIDER_REQUIRED", "Payment provider is required");
        }
        if (provider != PaymentProvider.VNPAY) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PROVIDER_DISABLED", "Only VNPay sandbox is enabled");
        }
        if (planCode != PlanCode.PRO) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PLAN_NOT_SUPPORTED", "Only Premium plan is supported for checkout");
        }
        int resolvedMonths = resolveDurationMonths(durationMonths);
        long amountVnd = resolveAmountVnd(resolvedMonths);

        PaymentOrder order = new PaymentOrder();
        order.setUserId(userId);
        order.setPlanCode(planCode);
        order.setDurationMonths(resolvedMonths);
        order.setAmountVnd(amountVnd);
        order.setProvider(provider);
        order.setStatus(PaymentStatus.PENDING);
        order.setOrderCode(generateOrderCode());
        paymentOrderRepository.save(order);

        String payUrl = createVnpayUrl(order, clientIp);
        order.setPayUrl(payUrl);
        paymentOrderRepository.save(order);
        return new CheckoutResponse(order.getOrderCode(), payUrl);
    }

    public PaymentResult handleVnpayReturn(Map<String, String> params) {
        return handleVnpayCallback(params);
    }

    public PaymentResult handleVnpayIpn(Map<String, String> params) {
        return handleVnpayCallback(params);
    }

    private PaymentResult handleVnpayCallback(Map<String, String> params) {
        if (!verifyVnpaySignature(params)) {
            return PaymentResult.failed("INVALID_SIGNATURE");
        }
        String orderCode = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionStatus = params.get("vnp_TransactionStatus");
        String transactionNo = params.get("vnp_TransactionNo");
        String amountRaw = params.get("vnp_Amount");

        PaymentOrder order = paymentOrderRepository.findByOrderCode(orderCode)
            .orElse(null);
        if (order == null) {
            return PaymentResult.failed("ORDER_NOT_FOUND");
        }

        if (!isMatchingAmount(order, amountRaw, 100)) {
            return PaymentResult.failed("INVALID_AMOUNT");
        }

        boolean success = "00".equals(responseCode) && (transactionStatus == null || "00".equals(transactionStatus));
        if (success) {
            if (order.getStatus() != PaymentStatus.PAID) {
                order.setStatus(PaymentStatus.PAID);
                order.setProviderTransId(transactionNo);
                order.setResponseCode(responseCode);
                paymentOrderRepository.save(order);
                billingService.activatePaidSubscription(
                    order.getUserId(),
                    order.getPlanCode(),
                    order.getDurationMonths(),
                    PaymentProvider.VNPAY,
                    transactionNo
                );
            }
            return PaymentResult.success(order.getOrderCode());
        }

        order.setStatus(PaymentStatus.FAILED);
        order.setResponseCode(responseCode);
        paymentOrderRepository.save(order);
        return PaymentResult.failed("PAYMENT_FAILED");
    }

    public PaymentResult handleMomoReturn(Map<String, String> params) {
        return handleMomoCallback(params);
    }

    public PaymentResult handleMomoIpn(Map<String, String> params) {
        return handleMomoCallback(params);
    }

    private PaymentResult handleMomoCallback(Map<String, String> params) {
        if (!verifyMomoSignature(params)) {
            return PaymentResult.failed("INVALID_SIGNATURE");
        }
        String orderCode = params.get("orderId");
        String resultCode = params.get("resultCode");
        String transId = params.get("transId");
        String amountRaw = params.get("amount");

        PaymentOrder order = paymentOrderRepository.findByOrderCode(orderCode)
            .orElse(null);
        if (order == null) {
            return PaymentResult.failed("ORDER_NOT_FOUND");
        }

        if (!isMatchingAmount(order, amountRaw, 1)) {
            return PaymentResult.failed("INVALID_AMOUNT");
        }

        boolean success = "0".equals(resultCode);
        if (success) {
            if (order.getStatus() != PaymentStatus.PAID) {
                order.setStatus(PaymentStatus.PAID);
                order.setProviderTransId(transId);
                order.setResponseCode(resultCode);
                paymentOrderRepository.save(order);
                billingService.activatePaidSubscription(
                    order.getUserId(),
                    order.getPlanCode(),
                    order.getDurationMonths(),
                    PaymentProvider.MOMO,
                    transId
                );
            }
            return PaymentResult.success(order.getOrderCode());
        }

        order.setStatus(PaymentStatus.FAILED);
        order.setResponseCode(resultCode);
        paymentOrderRepository.save(order);
        return PaymentResult.failed("PAYMENT_FAILED");
    }

    private String createVnpayUrl(PaymentOrder order, String clientIp) {
        if (isBlank(vnpayProperties.getTmnCode()) || isBlank(vnpayProperties.getHashSecret())) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "VNPAY_NOT_CONFIGURED", "VNPay is not configured");
        }
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        String createDate = now.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String expireDate = now.plusMinutes(15).format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        Map<String, String> params = new LinkedHashMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnpayProperties.getTmnCode());
        params.put("vnp_Amount", String.valueOf(order.getAmountVnd() * 100));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", order.getOrderCode());
        params.put("vnp_OrderInfo", buildOrderInfo(order));
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", isBlank(vnpayProperties.getLocale()) ? "vn" : vnpayProperties.getLocale());
        params.put("vnp_ReturnUrl", vnpayProperties.getReturnUrl());
        params.put("vnp_IpAddr", clientIp);
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        String query = buildQueryString(params);
        String hashData = buildQueryString(params);
        String secureHash = hmacSHA512(vnpayProperties.getHashSecret(), hashData);

        return UriComponentsBuilder.fromUriString(vnpayProperties.getPayUrl())
            .query(query + "&vnp_SecureHash=" + secureHash)
            .build(true)
            .toUriString();
    }

    private String createMomoPayment(PaymentOrder order) {
        if (isBlank(momoProperties.getPartnerCode()) || isBlank(momoProperties.getAccessKey()) || isBlank(momoProperties.getSecretKey())) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "MOMO_NOT_CONFIGURED", "MoMo is not configured");
        }
        String requestId = UUID.randomUUID().toString();
        order.setRequestId(requestId);
        paymentOrderRepository.save(order);

        String orderInfo = buildOrderInfo(order);
        String amount = String.valueOf(order.getAmountVnd());
        String extraData = Base64.getEncoder().encodeToString(
            ("plan=" + order.getPlanCode() + ";months=" + order.getDurationMonths()).getBytes(StandardCharsets.UTF_8)
        );

        String rawSignature = "accessKey=" + momoProperties.getAccessKey()
            + "&amount=" + amount
            + "&extraData=" + extraData
            + "&ipnUrl=" + momoProperties.getIpnUrl()
            + "&orderId=" + order.getOrderCode()
            + "&orderInfo=" + orderInfo
            + "&partnerCode=" + momoProperties.getPartnerCode()
            + "&redirectUrl=" + momoProperties.getRedirectUrl()
            + "&requestId=" + requestId
            + "&requestType=" + momoProperties.getRequestType();

        String signature = hmacSHA256(momoProperties.getSecretKey(), rawSignature);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("partnerCode", momoProperties.getPartnerCode());
        payload.put("accessKey", momoProperties.getAccessKey());
        payload.put("requestId", requestId);
        payload.put("amount", amount);
        payload.put("orderId", order.getOrderCode());
        payload.put("orderInfo", orderInfo);
        payload.put("redirectUrl", momoProperties.getRedirectUrl());
        payload.put("ipnUrl", momoProperties.getIpnUrl());
        payload.put("extraData", extraData);
        payload.put("requestType", momoProperties.getRequestType());
        payload.put("lang", momoProperties.getLang());
        payload.put("signature", signature);

        String body;
        try {
            body = objectMapper.writeValueAsString(payload);
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "MOMO_PAYLOAD_ERROR", "Unable to build MoMo payload");
        }

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(momoProperties.getEndpoint()))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();

        HttpResponse<String> response;
        try {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ApiException(HttpStatus.BAD_GATEWAY, "MOMO_UNAVAILABLE", "Unable to reach MoMo API");
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "MOMO_UNAVAILABLE", "Unable to reach MoMo API");
        }

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "MOMO_ERROR", "MoMo API returned an error");
        }

        try {
            JsonNode root = objectMapper.readTree(response.body());
            String payUrl = root.path("payUrl").asText(null);
            if (isBlank(payUrl)) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "MOMO_ERROR", "MoMo did not return a payUrl");
            }
            return payUrl;
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "MOMO_ERROR", "Unable to parse MoMo response");
        }
    }

    private boolean verifyVnpaySignature(Map<String, String> params) {
        if (params == null || params.isEmpty()) {
            return false;
        }
        String secureHash = params.get("vnp_SecureHash");
        if (isBlank(secureHash)) {
            return false;
        }
        Map<String, String> filtered = params.entrySet().stream()
            .filter(entry -> entry.getValue() != null)
            .filter(entry -> !"vnp_SecureHash".equals(entry.getKey()) && !"vnp_SecureHashType".equals(entry.getKey()))
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
        String hashData = buildQueryString(filtered);
        String computed = hmacSHA512(vnpayProperties.getHashSecret(), hashData);
        return secureHash.equalsIgnoreCase(computed);
    }

    private boolean verifyMomoSignature(Map<String, String> params) {
        if (params == null || params.isEmpty()) {
            return false;
        }
        String signature = params.get("signature");
        if (isBlank(signature)) {
            return false;
        }
        String rawSignature = "accessKey=" + momoProperties.getAccessKey()
            + "&amount=" + nullSafe(params.get("amount"))
            + "&extraData=" + nullSafe(params.get("extraData"))
            + "&message=" + nullSafe(params.get("message"))
            + "&orderId=" + nullSafe(params.get("orderId"))
            + "&orderInfo=" + nullSafe(params.get("orderInfo"))
            + "&orderType=" + nullSafe(params.get("orderType"))
            + "&partnerCode=" + nullSafe(params.get("partnerCode"))
            + "&payType=" + nullSafe(params.get("payType"))
            + "&requestId=" + nullSafe(params.get("requestId"))
            + "&responseTime=" + nullSafe(params.get("responseTime"))
            + "&resultCode=" + nullSafe(params.get("resultCode"))
            + "&transId=" + nullSafe(params.get("transId"));
        String computed = hmacSHA256(momoProperties.getSecretKey(), rawSignature);
        return signature.equalsIgnoreCase(computed);
    }

    private boolean isMatchingAmount(PaymentOrder order, String amountRaw, int multiplier) {
        if (order == null || amountRaw == null) {
            return false;
        }
        try {
            long amount = Long.parseLong(amountRaw);
            return amount == order.getAmountVnd() * multiplier;
        } catch (NumberFormatException ex) {
            return false;
        }
    }

    private int resolveDurationMonths(Integer durationMonths) {
        if (durationMonths == null) {
            return 1;
        }
        if (!PREMIUM_PRICING_VND.containsKey(durationMonths)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_DURATION", "Unsupported billing duration");
        }
        return durationMonths;
    }

    private long resolveAmountVnd(int durationMonths) {
        Long amount = PREMIUM_PRICING_VND.get(durationMonths);
        if (amount == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_DURATION", "Unsupported billing duration");
        }
        return amount;
    }

    private String generateOrderCode() {
        return "CE" + System.currentTimeMillis() + (int) (Math.random() * 1000);
    }

    private String buildOrderInfo(PaymentOrder order) {
        return String.format(Locale.ENGLISH, "ConnectEXE Premium %s months", order.getDurationMonths());
    }

    private String buildQueryString(Map<String, String> params) {
        return params.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(entry -> {
                String key = entry.getKey();
                String value = entry.getValue();
                if (value == null) {
                    return "";
                }
                return key + "=" + urlEncode(value);
            })
            .filter(item -> !item.isBlank())
            .collect(Collectors.joining("&"));
    }

    private String urlEncode(String value) {
        try {
            return URLEncoder.encode(value, StandardCharsets.UTF_8.toString());
        } catch (Exception ex) {
            return "";
        }
    }

    private String hmacSHA512(String secret, String data) {
        return hmac("HmacSHA512", secret, data);
    }

    private String hmacSHA256(String secret, String data) {
        return hmac("HmacSHA256", secret, data);
    }

    private String hmac(String algorithm, String secret, String data) {
        try {
            Mac hmac = Mac.getInstance(algorithm);
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), algorithm);
            hmac.init(secretKey);
            byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder();
            for (byte b : bytes) {
                builder.append(String.format("%02x", b));
            }
            return builder.toString();
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "SIGNATURE_ERROR", "Unable to sign payload");
        }
    }

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    public static class PaymentResult {
        private final boolean success;
        private final String orderCode;
        private final String message;

        private PaymentResult(boolean success, String orderCode, String message) {
            this.success = success;
            this.orderCode = orderCode;
            this.message = message;
        }

        public static PaymentResult success(String orderCode) {
            return new PaymentResult(true, orderCode, "SUCCESS");
        }

        public static PaymentResult failed(String message) {
            return new PaymentResult(false, null, message);
        }

        public boolean isSuccess() {
            return success;
        }

        public String getOrderCode() {
            return orderCode;
        }

        public String getMessage() {
            return message;
        }
    }
}
