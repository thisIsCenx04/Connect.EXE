package com.connectexe.halloffame.service;

import com.connectexe.common.exception.ApiException;
import com.connectexe.halloffame.domain.entity.HallOfFameEntry;
import com.connectexe.halloffame.domain.entity.HallOfFameVote;
import com.connectexe.halloffame.domain.entity.HallOfFameVoteId;
import com.connectexe.halloffame.domain.enums.HallOfFameStatus;
import com.connectexe.halloffame.domain.enums.HallOfFameType;
import com.connectexe.halloffame.dto.HallOfFameApplyRequest;
import com.connectexe.halloffame.dto.HallOfFameDecisionRequest;
import com.connectexe.halloffame.dto.HallOfFameResponse;
import com.connectexe.halloffame.dto.HallOfFameVoteRequest;
import com.connectexe.halloffame.repository.HallOfFameEntryRepository;
import com.connectexe.halloffame.repository.HallOfFameVoteRepository;
import com.connectexe.halloffame.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class HallOfFameService {
    private static final HallOfFameStatus PUBLIC_STATUS = HallOfFameStatus.APPROVED;

    private final HallOfFameEntryRepository entryRepository;
    private final HallOfFameVoteRepository voteRepository;

    public HallOfFameService(HallOfFameEntryRepository entryRepository,
                             HallOfFameVoteRepository voteRepository) {
        this.entryRepository = entryRepository;
        this.voteRepository = voteRepository;
    }

    public HallOfFameResponse apply(HallOfFameApplyRequest request, UserPrincipal principal) {
        requireAuthenticated(principal);
        if (entryRepository.existsByTypeAndReferenceId(request.getType(), request.getReferenceId())) {
            throw new ApiException(HttpStatus.CONFLICT, "HOF_EXISTS", "Entry already applied");
        }

        HallOfFameEntry entry = new HallOfFameEntry();
        entry.setType(request.getType());
        entry.setReferenceId(request.getReferenceId());
        entry.setAppliedBy(principal.getUserId());
        entry.setStatus(HallOfFameStatus.APPLIED);
        HallOfFameEntry saved = entryRepository.save(entry);
        return toResponse(saved, 0L);
    }

    public HallOfFameResponse get(UUID id, UserPrincipal principal) {
        HallOfFameEntry entry = entryRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "HOF_NOT_FOUND", "Entry not found"));
        if (entry.getStatus() == PUBLIC_STATUS || isAdmin(principal) || isApplicant(entry, principal)) {
            long votes = voteRepository.countByIdEntryId(entry.getId());
            return toResponse(entry, votes);
        }
        throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Not allowed");
    }

    public List<HallOfFameResponse> list(HallOfFameType type, HallOfFameStatus status, UserPrincipal principal) {
        HallOfFameStatus effectiveStatus = status == null ? PUBLIC_STATUS : status;
        if (effectiveStatus != PUBLIC_STATUS && !isAdmin(principal)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Not allowed");
        }

        List<HallOfFameEntry> entries = type == null
            ? entryRepository.findByStatusOrderByScoreDesc(effectiveStatus)
            : entryRepository.findByStatusAndTypeOrderByScoreDesc(effectiveStatus, type);
        return entries.stream()
            .map(entry -> toResponse(entry, voteRepository.countByIdEntryId(entry.getId())))
            .toList();
    }

    public HallOfFameResponse review(UUID id, HallOfFameDecisionRequest request, UserPrincipal principal) {
        requireAdmin(principal);
        if (request.getStatus() != HallOfFameStatus.APPROVED && request.getStatus() != HallOfFameStatus.REJECTED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_STATUS", "Status must be APPROVED or REJECTED");
        }

        HallOfFameEntry entry = entryRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "HOF_NOT_FOUND", "Entry not found"));
        entry.setStatus(request.getStatus());
        entry.setReviewedBy(principal.getUserId());
        entry.setReviewedAt(OffsetDateTime.now());
        HallOfFameEntry saved = entryRepository.save(entry);
        long votes = voteRepository.countByIdEntryId(saved.getId());
        return toResponse(saved, votes);
    }

    public HallOfFameResponse vote(UUID entryId, HallOfFameVoteRequest request, UserPrincipal principal) {
        requireAuthenticated(principal);
        if (request.getValue() == null || request.getValue() < 1 || request.getValue() > 5) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_RATING", "Rating must be between 1 and 5");
        }

        HallOfFameEntry entry = entryRepository.findById(entryId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "HOF_NOT_FOUND", "Entry not found"));
        if (entry.getStatus() != PUBLIC_STATUS) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_STATUS", "Entry is not approved");
        }

        HallOfFameVote vote = new HallOfFameVote();
        vote.setId(new HallOfFameVoteId(entryId, principal.getUserId()));
        vote.setEntry(entry);
        vote.setValue(request.getValue().shortValue());
        voteRepository.save(vote);

        Double avg = voteRepository.averageForEntry(entryId);
        BigDecimal score = avg == null ? BigDecimal.ZERO : BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP);
        entry.setScore(score);
        HallOfFameEntry saved = entryRepository.save(entry);
        long votes = voteRepository.countByIdEntryId(entryId);
        return toResponse(saved, votes);
    }

    private HallOfFameResponse toResponse(HallOfFameEntry entry, long ratingCount) {
        return new HallOfFameResponse(
            entry.getId(),
            entry.getType(),
            entry.getReferenceId(),
            entry.getScore(),
            entry.getStatus(),
            ratingCount,
            entry.getCreatedAt(),
            entry.getUpdatedAt()
        );
    }

    private void requireAuthenticated(UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Unauthorized");
        }
    }

    private void requireAdmin(UserPrincipal principal) {
        if (!isAdmin(principal)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Not allowed");
        }
    }

    private boolean isAdmin(UserPrincipal principal) {
        if (principal == null) {
            return false;
        }
        return principal.getRoles().contains("ROLE_ADMIN");
    }

    private boolean isApplicant(HallOfFameEntry entry, UserPrincipal principal) {
        if (principal == null || entry.getAppliedBy() == null) {
            return false;
        }
        return entry.getAppliedBy().equals(principal.getUserId());
    }
}
