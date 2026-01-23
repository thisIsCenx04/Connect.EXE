package com.connectexe.forum.repository;

import com.connectexe.forum.domain.entity.ForumVote;
import com.connectexe.forum.domain.entity.ForumVoteId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ForumVoteRepository extends JpaRepository<ForumVote, ForumVoteId> {
}
