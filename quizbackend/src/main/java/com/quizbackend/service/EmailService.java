package com.quizbackend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;

import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${email.from.name}")
    private String fromName;

    @Value("${email.from.address}")
    private String fromEmail;

    @Value("${email.from.replyTo}")
    private String replyTo;

    @Autowired
    private RestTemplate restTemplate;

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    @PostConstruct
    public void init() {
        logger.info("EmailService initialized with Brevo API");
        logger.debug("Base URL: {}, Frontend URL: {}", baseUrl, frontendUrl);
        logger.debug("Sender configuration - Name: {}, Email: {}, ReplyTo: {}",
                     fromName, fromEmail, replyTo);
    }

    /**
     * Send verification email to user
     */
    public void sendVerificationEmail(String toEmail, String username, String token) {
        logger.info("Sending verification email to: {}", toEmail);
        
        // Point to frontend URL instead of backend API
        String verificationLink = String.format("%s/email-verified?token=%s", frontendUrl, token);
        String htmlContent = buildModernEmailTemplate(username, verificationLink);
        
        try {
            sendEmail(toEmail, username, "Verify Your FlashMind Account ✨", htmlContent);
            logger.info("Verification email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send verification email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    /**
     * Send password reset email to user
     */
    public void sendPasswordResetEmail(String toEmail, String username, String token) {
        logger.info("Sending password reset email to: {}", toEmail);
        
        String resetLink = String.format("%s/reset-password?token=%s", frontendUrl, token);
        String htmlContent = buildPasswordResetTemplate(username, resetLink);
        
        try {
            sendEmail(toEmail, username, "Reset Your FlashMind Password 🔐", htmlContent);
            logger.info("Password reset email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send password reset email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    /**
     * Send email using Brevo API
     */
    public void sendEmail(String toEmail, String toName, String subject, String htmlContent) {
        logger.debug("Preparing to send email to: {} with subject: {}", toEmail, subject);

        // Prepare email payload for Brevo API
        Map<String, Object> emailPayload = new HashMap<>();
        
        // Sender details (Brevo requires "sender" field, not "from")
        Map<String, String> senderMap = new HashMap<>();
        senderMap.put("name", fromName);
        senderMap.put("email", fromEmail);
        emailPayload.put("sender", senderMap);

        // To details - now includes both email and name
        Map<String, String> toMap = new HashMap<>();
        toMap.put("email", toEmail);
        toMap.put("name", toName);
        emailPayload.put("to", Arrays.asList(toMap));

        // Email content
        emailPayload.put("subject", subject);
        emailPayload.put("htmlContent", htmlContent);

        // Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoApiKey);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(emailPayload, headers);

        try {
            logger.debug("Calling Brevo API for email to: {}", toEmail);
            ResponseEntity<String> response = restTemplate.postForEntity(
                BREVO_API_URL,
                requestEntity,
                String.class
            );

            if (response.getStatusCode() == HttpStatus.CREATED) {
                logger.info("Email sent successfully via Brevo API to: {}", toEmail);
            } else {
                logger.error("Brevo API returned non-201 status: {} for email to: {}",
                    response.getStatusCode(), toEmail);
                throw new RuntimeException("Brevo API returned status: " + response.getStatusCode());
            }

        } catch (ResourceAccessException e) {
            logger.error("Failed to connect to Brevo API for email to: {}", toEmail, e);
            throw new RuntimeException("Failed to connect to email service", e);
        } catch (Exception e) {
            logger.error("Failed to send email via Brevo API to: {}", toEmail, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    /**
     * Build modern email template for verification
     */
    public String buildModernEmailTemplate(String username, String verificationLink) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html lang=\"en\">");
        html.append("<head>");
        html.append("    <meta charset=\"UTF-8\">");
        html.append("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        html.append("    <title>Verify Your FlashMind Account</title>");
        html.append("</head>");
        html.append("<body style=\"margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center;\">");
        html.append("    <div style=\"max-width: 600px; margin: 0 auto; padding: 20px;\">");
        html.append("        <div style=\"background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;\">");
        html.append("            <!-- Header with gradient -->");
        html.append("            <div style=\"background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;\">");
        html.append("                <div style=\"background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(0,0,0,0.1);\">");
        html.append("                    <span style=\"font-size: 40px;\">🧠</span>");
        html.append("                </div>");
        html.append("                <h1 style=\"color: white; margin: 0; font-size: 28px; font-weight: 700;\">FlashMind Quiz</h1>");
        html.append("                <p style=\"color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;\">Welcome to the future of learning!</p>");
        html.append("            </div>");
        html.append("");
        html.append("            <!-- Content -->");
        html.append("            <div style=\"padding: 40px; text-align: center;\">");
        html.append("                <h2 style=\"color: #333; margin: 0 0 20px; font-size: 24px; font-weight: 600;\">Verify Your Account ✨</h2>");
        html.append("                ");
        html.append("                <p style=\"color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;\">");
        html.append("                    Hello <strong>").append(username).append("</strong>!");
        html.append("                </p>");
        html.append("                ");
        html.append("                <p style=\"color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;\">");
        html.append("                    Thank you for joining FlashMind Quiz! To complete your registration and start creating amazing quizzes, please verify your email address by clicking the button below.");
        html.append("                </p>");
        html.append("");
        html.append("                <!-- CTA Button -->");
        html.append("                <div style=\"margin: 40px 0;\">");
        html.append("                    <a href=\"").append(verificationLink).append("\" style=\"display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; transition: all 0.3s ease; box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);\" onmouseover=\"this.style.transform='translateY(-2px)'; this.style.boxShadow='0 15px 30px rgba(102, 126, 234, 0.4)'\" onmouseout=\"this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 20px rgba(102, 126, 234, 0.3)'\">Verify Email Address</a>");
        html.append("                </div>");
        html.append("");
        html.append("                <!-- Security Note -->");
        html.append("                <div style=\"background: #f8f9ff; border: 1px solid #e1e8ff; border-radius: 10px; padding: 20px; margin: 30px 0;\">");
        html.append("                    <p style=\"color: #5a67d8; font-size: 14px; line-height: 1.5; margin: 0;\">");
        html.append("                        🔒 <strong>Security Note:</strong> This verification link will expire in 24 hours. If you didn't create an account with FlashMind, please ignore this email.");
        html.append("                    </p>");
        html.append("                </div>");
        html.append("");
        html.append("                <!-- Fallback Link -->");
        html.append("                <p style=\"color: #999; font-size: 14px; line-height: 1.5; margin: 30px 0 0;\">");
        html.append("                    If the button doesn't work, copy and paste this link into your browser:<br>");
        html.append("                    <span style=\"color: #667eea; word-break: break-all;\">").append(verificationLink).append("</span>");
        html.append("                </p>");
        html.append("            </div>");
        html.append("");
        html.append("            <!-- Footer -->");
        html.append("            <div style=\"background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;\">");
        html.append("                <p style=\"color: #666; font-size: 14px; margin: 0 0 10px;\">");
        html.append("                    © 2024 FlashMind Quiz. All rights reserved.");
        html.append("                </p>");
        html.append("                <p style=\"color: #999; font-size: 12px; margin: 0;\">");
        html.append("                    Empowering education through innovative quiz technology");
        html.append("                </p>");
        html.append("            </div>");
        html.append("        </div>");
        html.append("    </div>");
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }

    /**
     * Build password reset email template
     */
    public String buildPasswordResetTemplate(String username, String resetLink) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html lang=\"en\">");
        html.append("<head>");
        html.append("    <meta charset=\"UTF-8\">");
        html.append("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        html.append("    <title>Reset Your FlashMind Password</title>");
        html.append("</head>");
        html.append("<body style=\"margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center;\">");
        html.append("    <div style=\"max-width: 600px; margin: 0 auto; padding: 20px;\">");
        html.append("        <div style=\"background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;\">");
        html.append("            <!-- Header with gradient -->");
        html.append("            <div style=\"background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;\">");
        html.append("                <div style=\"background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(0,0,0,0.1);\">");
        html.append("                    <span style=\"font-size: 40px;\">🔐</span>");
        html.append("                </div>");
        html.append("                <h1 style=\"color: white; margin: 0; font-size: 28px; font-weight: 700;\">FlashMind Quiz</h1>");
        html.append("                <p style=\"color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;\">Your password reset request</p>");
        html.append("            </div>");
        html.append("");
        html.append("            <!-- Content -->");
        html.append("            <div style=\"padding: 40px; text-align: center;\">");
        html.append("                <h2 style=\"color: #333; margin: 0 0 20px; font-size: 24px; font-weight: 600;\">Reset Your Password 🔑</h2>");
        html.append("                ");
        html.append("                <p style=\"color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;\">");
        html.append("                    Hello <strong>").append(username).append("</strong>!");
        html.append("                </p>");
        html.append("                ");
        html.append("                <p style=\"color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;\">");
        html.append("                    We received a request to reset your password for your FlashMind Quiz account. Click the button below to choose a new password.");
        html.append("                </p>");
        html.append("");
        html.append("                <!-- CTA Button -->");
        html.append("                <div style=\"margin: 40px 0;\">");
        html.append("                    <a href=\"").append(resetLink).append("\" style=\"display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; transition: all 0.3s ease; box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);\" onmouseover=\"this.style.transform='translateY(-2px)'; this.style.boxShadow='0 15px 30px rgba(102, 126, 234, 0.4)'\" onmouseout=\"this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 20px rgba(102, 126, 234, 0.3)'\">Reset Password</a>");
        html.append("                </div>");
        html.append("");
        html.append("                <!-- Security Note -->");
        html.append("                <div style=\"background: #fff5f5; border: 1px solid #fed7d7; border-radius: 10px; padding: 20px; margin: 30px 0;\">");
        html.append("                    <p style=\"color: #e53e3e; font-size: 14px; line-height: 1.5; margin: 0;\">");
        html.append("                        ⚠️ <strong>Important:</strong> This password reset link will expire in 1 hour. If you didn't request this password reset, please ignore this email and your password will remain unchanged.");
        html.append("                    </p>");
        html.append("                </div>");
        html.append("");
        html.append("                <!-- Fallback Link -->");
        html.append("                <p style=\"color: #999; font-size: 14px; line-height: 1.5; margin: 30px 0 0;\">");
        html.append("                    If the button doesn't work, copy and paste this link into your browser:<br>");
        html.append("                    <span style=\"color: #667eea; word-break: break-all;\">").append(resetLink).append("</span>");
        html.append("                </p>");
        html.append("            </div>");
        html.append("");
        html.append("            <!-- Footer -->");
        html.append("            <div style=\"background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;\">");
        html.append("                <p style=\"color: #666; font-size: 14px; margin: 0 0 10px;\">");
        html.append("                    © 2024 FlashMind Quiz. All rights reserved.");
        html.append("                </p>");
        html.append("                <p style=\"color: #999; font-size: 12px; margin: 0;\">");
        html.append("                    Empowering education through innovative quiz technology");
        html.append("                </p>");
        html.append("            </div>");
        html.append("        </div>");
        html.append("    </div>");
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
}