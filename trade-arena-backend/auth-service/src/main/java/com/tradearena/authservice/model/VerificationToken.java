package com.tradearena.authservice.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;

@Entity
@Table(name = "verification_tokens")
public class VerificationToken {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String token;

	@OneToOne
	@JoinColumn(name = "user_id", nullable = false, unique = true)
	private User user;

	@CreationTimestamp
	@Column(updatable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime expiryTime;

	// 🔥 Constructor
	public VerificationToken(String token, User user) {
		this.token = token;
		this.user = user;
		this.expiryTime = LocalDateTime.now().plusMinutes(10);
	}

	public VerificationToken() {
	}

	// Getters & Setters

	public Long getId() {
		return id;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getExpiryTime() {
		return expiryTime;
	}

	public void setExpiryTime(LocalDateTime expiryTime) {
		this.expiryTime = expiryTime;
	}

	// ✅ Helper method
	public boolean isExpired() {
		return LocalDateTime.now().isAfter(expiryTime);
	}
}