package com.tradearena.authservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tradearena.authservice.model.User;
import com.tradearena.authservice.model.VerificationToken;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {

    Optional<VerificationToken> findByUser(User user);

    Optional<VerificationToken> findByToken(String token);
}