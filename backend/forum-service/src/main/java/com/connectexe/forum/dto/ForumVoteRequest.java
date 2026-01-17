package com.connectexe.forum.dto;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.connectexe.forum.domain.enums.VoteType;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ForumVoteRequest {
    @NotNull
    private VoteType vote;
}
