package com.connectexe.auth.controller;

import com.connectexe.auth.domain.entity.User;
import com.connectexe.auth.dto.InvestorMatchResponse;
import com.connectexe.auth.dto.InvestorPreferenceRequest;
import com.connectexe.auth.dto.InvestorPreferenceResponse;
import com.connectexe.auth.service.InvestorPreferenceService;
import com.connectexe.common.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/investors")
public class InvestorMatchingController {

    private final InvestorPreferenceService preferenceService;

    public InvestorMatchingController(InvestorPreferenceService preferenceService) {
        this.preferenceService = preferenceService;
    }

    @GetMapping("/{id}/preferences")
    public ResponseEntity<ApiResponse<InvestorPreferenceResponse>> getPreferences(@PathVariable("id") UUID id,
                                                                                  @AuthenticationPrincipal User user) {
        InvestorPreferenceResponse response = preferenceService.getPreferences(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Preferences loaded", response));
    }

    @PutMapping("/{id}/preferences")
    public ResponseEntity<ApiResponse<InvestorPreferenceResponse>> upsertPreferences(@PathVariable("id") UUID id,
                                                                                     @Valid @RequestBody InvestorPreferenceRequest request,
                                                                                     @AuthenticationPrincipal User user) {
        InvestorPreferenceResponse response = preferenceService.upsertPreferences(id, request, user);
        return ResponseEntity.ok(ApiResponse.ok("Preferences saved", response));
    }

    @GetMapping("/matching")
    public ResponseEntity<ApiResponse<List<InvestorMatchResponse>>> matchInvestors(
        @RequestParam(value = "industry", required = false) String industry,
        @RequestParam(value = "stage", required = false) String stage,
        @RequestParam(value = "minFundingUsd", required = false) BigDecimal minFundingUsd,
        @RequestParam(value = "maxFundingUsd", required = false) BigDecimal maxFundingUsd,
        @RequestParam(value = "country", required = false) String country,
        @RequestParam(value = "city", required = false) String city
    ) {
        List<InvestorMatchResponse> response = preferenceService.matchInvestors(
            industry,
            stage,
            minFundingUsd,
            maxFundingUsd,
            country,
            city
        );
        return ResponseEntity.ok(ApiResponse.ok("Investors matched", response));
    }
}
