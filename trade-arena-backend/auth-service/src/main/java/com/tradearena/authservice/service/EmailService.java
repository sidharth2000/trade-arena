package com.tradearena.authservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

	@Autowired
	private JavaMailSender mailSender;

	@Value("${spring.mail.username}")
	private String from;

	public void sendOtpEmail(String email, String otp) {
		SimpleMailMessage msg = new SimpleMailMessage();
		msg.setTo(email);
		msg.setFrom(from);
		msg.setSubject("TradeArena - Your OTP");
		msg.setText("Your OTP is: " + otp + "\nValid for 10 minutes.");
		mailSender.send(msg);
	}
}


