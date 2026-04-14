package com.tradearena.authservice.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

	@Autowired
	private JavaMailSender mailSender;

	@Value("${spring.mail.username}")
	private String from;

	public void sendOtpEmail(String email, String otp) {
		try {
			MimeMessage message = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

			helper.setTo(email);
			helper.setFrom("Trade Arena <" + from + ">");
			helper.setSubject("🔐 Your TradeArena Verification Code");
			helper.setText(buildHtml(otp), true); // true = isHtml

			mailSender.send(message);
		} catch (MessagingException e) {
			throw new RuntimeException("Failed to send OTP email", e);
		}
	}

	private String buildHtml(String otp) {
		return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            </head>
            <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">

              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
                <tr>
                  <td align="center">
                    <table width="480" cellpadding="0" cellspacing="0"
                           style="background:#ffffff;border-radius:12px;overflow:hidden;
                                  box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                      <!-- Header -->
                      <tr>
                        <td style="background:#2874f0;padding:32px 40px;text-align:center;">
                          <div style="color:#ffffff;font-size:26px;font-weight:700;
                                      letter-spacing:-0.5px;">TradeArena</div>
                          <div style="color:#ffe500;font-size:12px;font-style:italic;
                                      margin-top:4px;">buy &amp; sell smarter</div>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="padding:40px 40px 32px;">
                          <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:22px;
                                     font-weight:700;">Verify your email</h2>
                          <p style="margin:0 0 28px;color:#666;font-size:14px;
                                    line-height:1.6;">
                            Use the code below to complete your TradeArena registration.
                            This code is valid for <strong>10 minutes</strong>.
                          </p>

                          <!-- OTP Box -->
                          <div style="background:#eef2ff;border:2px dashed #2874f0;
                                      border-radius:10px;padding:24px;text-align:center;
                                      margin-bottom:28px;">
                            <div style="font-size:11px;color:#2874f0;font-weight:600;
                                        letter-spacing:2px;text-transform:uppercase;
                                        margin-bottom:8px;">Your verification code</div>
                            <div style="font-size:42px;font-weight:800;
                                        letter-spacing:12px;color:#1a1a1a;
                                        font-family:monospace;">%s</div>
                          </div>

                          <p style="margin:0 0 8px;color:#999;font-size:12px;
                                    text-align:center;">
                            Didn't request this? You can safely ignore this email.
                          </p>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="background:#f9f9f9;padding:20px 40px;
                                   border-top:1px solid #eeeeee;text-align:center;">
                          <p style="margin:0;color:#aaa;font-size:11px;">
                            © 2025 TradeArena · University of Limerick Project
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>

            </body>
            </html>
            """.formatted(otp);
	}
}