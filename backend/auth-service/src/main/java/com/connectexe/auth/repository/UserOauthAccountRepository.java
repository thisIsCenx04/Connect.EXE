package com.connectexe.auth.repository;

import com.connectexe.auth.domain.entity.UserOauthAccount;
import com.connectexe.auth.domain.enums.OauthProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserOauthAccountRepository extends JpaRepository<UserOauthAccount, UUID> {
    Optional<UserOauthAccount> findByProviderAndProviderUid(OauthProvider provider, String providerUid);
}
