package com.tradearena.authservice.service;

import java.util.Optional;

import com.tradearena.authservice.model.User;

public interface UserService {
	Optional<User> getUserById(Integer userId);
}
