package com.connectexe.auth.service;

import com.connectexe.auth.domain.entity.InvestorPreference;
import com.connectexe.auth.domain.entity.User;
import com.connectexe.auth.domain.enums.UserRole;
import com.connectexe.auth.dto.InvestorMatchResponse;
import com.connectexe.auth.dto.InvestorPreferenceRequest;
import com.connectexe.auth.dto.InvestorPreferenceResponse;
import com.connectexe.auth.repository.InvestorPreferenceRepository;
import com.connectexe.auth.repository.UserRepository;
import com.connectexe.common.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class InvestorPreferenceService {

    private final InvestorPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;

    public InvestorPreferenceService(InvestorPreferenceRepository preferenceRepository,
                                     UserRepository userRepository) {
        this.preferenceRepository = preferenceRepository;
        this.userRepository = userRepository;
    }

    public InvestorPreferenceResponse getPreferences(UUID userId, User requester) {
        assertSelfOrAdmin(userId, requester);
        InvestorPreference preference = preferenceRepository.findByUserId(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PREFERENCES_NOT_FOUND", "Preferences not found"));
        return toResponse(preference);
    }

    public InvestorPreferenceResponse upsertPreferences(UUID userId, InvestorPreferenceRequest request, User requester) {
        assertSelf(userId, requester);
        if (requester.getRole() != UserRole.INVESTOR) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ROLE", "Only investors can update preferences");
        }
        InvestorPreference preference = preferenceRepository.findByUserId(userId)
            .orElseGet(InvestorPreference::new);
        preference.setUserId(userId);
        preference.setIndustries(joinValues(request.industries()));
        preference.setStages(joinValues(request.stages()));
        preference.setMinFundingUsd(request.minFundingUsd());
        preference.setMaxFundingUsd(request.maxFundingUsd());
        preference.setCountry(normalizeValue(request.country()));
        preference.setCity(normalizeValue(request.city()));
        InvestorPreference saved = preferenceRepository.save(preference);
        return toResponse(saved);
    }

    public List<InvestorMatchResponse> matchInvestors(String industry,
                                                      String stage,
                                                      BigDecimal minFundingUsd,
                                                      BigDecimal maxFundingUsd,
                                                      String country,
                                                      String city) {
        List<User> investors = userRepository.findByRole(UserRole.INVESTOR);
        List<InvestorMatchResponse> responses = new ArrayList<>();
        for (User investor : investors) {
            Optional<InvestorPreference> preference = preferenceRepository.findByUserId(investor.getId());
            int score = preference.map(pref -> scoreMatch(pref, industry, stage, minFundingUsd, maxFundingUsd, country, city))
                .orElse(0);
            if (score <= 0) {
                continue;
            }
            InvestorPreference pref = preference.orElse(null);
            responses.add(new InvestorMatchResponse(
                investor.getId(),
                investor.getFullName(),
                investor.getHeadline(),
                investor.getAvatarUrl(),
                investor.getCountry(),
                investor.getCity(),
                pref == null ? List.of() : splitValues(pref.getIndustries()),
                pref == null ? List.of() : splitValues(pref.getStages()),
                pref == null ? null : pref.getMinFundingUsd(),
                pref == null ? null : pref.getMaxFundingUsd(),
                score
            ));
        }
        responses.sort(Comparator.comparingInt(InvestorMatchResponse::score).reversed());
        return responses;
    }

    private int scoreMatch(InvestorPreference preference,
                           String industry,
                           String stage,
                           BigDecimal minFundingUsd,
                           BigDecimal maxFundingUsd,
                           String country,
                           String city) {
        int score = 0;
        if (industry != null && matchesValue(preference.getIndustries(), industry)) {
            score += 40;
        }
        if (stage != null && matchesValue(preference.getStages(), stage)) {
            score += 30;
        }
        if (minFundingUsd != null || maxFundingUsd != null) {
            if (matchesFunding(preference.getMinFundingUsd(), preference.getMaxFundingUsd(), minFundingUsd, maxFundingUsd)) {
                score += 20;
            }
        }
        if (country != null && preference.getCountry() != null
            && country.equalsIgnoreCase(preference.getCountry())) {
            score += 7;
        }
        if (city != null && preference.getCity() != null
            && city.equalsIgnoreCase(preference.getCity())) {
            score += 3;
        }
        return score;
    }

    private boolean matchesValue(String csv, String value) {
        if (csv == null || csv.isBlank() || value == null || value.isBlank()) {
            return false;
        }
        String needle = value.trim().toLowerCase(Locale.US);
        return splitValues(csv).stream().anyMatch(item -> item.equalsIgnoreCase(needle));
    }

    private boolean matchesFunding(BigDecimal prefMin,
                                   BigDecimal prefMax,
                                   BigDecimal projectMin,
                                   BigDecimal projectMax) {
        if (prefMin == null && prefMax == null) {
            return false;
        }
        BigDecimal effectiveProjectMin = projectMin;
        BigDecimal effectiveProjectMax = projectMax;
        if (effectiveProjectMin == null && effectiveProjectMax == null) {
            return false;
        }
        if (effectiveProjectMin == null) {
            effectiveProjectMin = effectiveProjectMax;
        }
        if (effectiveProjectMax == null) {
            effectiveProjectMax = effectiveProjectMin;
        }
        BigDecimal effectivePrefMin = prefMin == null ? effectiveProjectMin : prefMin;
        BigDecimal effectivePrefMax = prefMax == null ? effectiveProjectMax : prefMax;
        return effectiveProjectMin.compareTo(effectivePrefMax) <= 0
            && effectiveProjectMax.compareTo(effectivePrefMin) >= 0;
    }

    private String joinValues(List<String> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }
        return values.stream()
            .filter(value -> value != null && !value.isBlank())
            .map(value -> value.trim().toLowerCase(Locale.US))
            .distinct()
            .reduce((left, right) -> left + "," + right)
            .orElse(null);
    }

    private List<String> splitValues(String csv) {
        if (csv == null || csv.isBlank()) {
            return List.of();
        }
        String[] parts = csv.split(",");
        List<String> values = new ArrayList<>();
        for (String part : parts) {
            if (part != null && !part.isBlank()) {
                values.add(part.trim());
            }
        }
        return values;
    }

    private String normalizeValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private void assertSelf(UUID userId, User requester) {
        if (requester == null || !userId.equals(requester.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Not allowed");
        }
    }

    private void assertSelfOrAdmin(UUID userId, User requester) {
        if (requester == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Not allowed");
        }
        if (requester.getRole() != UserRole.ADMIN && !userId.equals(requester.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Not allowed");
        }
    }

    private InvestorPreferenceResponse toResponse(InvestorPreference preference) {
        return new InvestorPreferenceResponse(
            preference.getId(),
            preference.getUserId(),
            splitValues(preference.getIndustries()),
            splitValues(preference.getStages()),
            preference.getMinFundingUsd(),
            preference.getMaxFundingUsd(),
            preference.getCountry(),
            preference.getCity(),
            preference.getCreatedAt(),
            preference.getUpdatedAt()
        );
    }
}
