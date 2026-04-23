package com.tradearena.authservice.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tradearena.authservice.model.User;
import com.tradearena.authservice.repository.UserRepository;

@Service
public class UserServiceImpl implements UserService {
	
	@Autowired
	UserRepository userRepository;

	@Override
	public Optional<User> getUserById(Integer userId) {
		return userRepository.findById(userId);
	}

}
