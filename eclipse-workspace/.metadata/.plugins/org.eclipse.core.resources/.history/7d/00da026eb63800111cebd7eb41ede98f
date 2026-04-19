package com.tradearena.authservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tradearena.authservice.model.User;
import com.tradearena.authservice.model.VerificationToken;

public interface UserRepository extends JpaRepository<User,Integer> {

	boolean existsByEmail(String email);

	Optional<User> findByEmail(String email);

}
