package com.tradearena.notificationservice.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Base64;
import java.util.logging.Logger;

/**
 * JwtUtil — validates JWT tokens issued by the Auth Service.
 * The Notification Service NEVER generates tokens; it only validates them.
 * The JWT secret must match the one configured in the Auth Service exactly.
 */
@Component
public class JwtUtil {

    private static final Logger log = Logger.getLogger(JwtUtil.class.getName());

    private final Key signingKey;

    public JwtUtil(@Value("${app.jwt.secret:defaultSecretKeyForDevOnlyMustBe256BitsLongPlaceholder}") String secret) {        byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(secret);
        } catch (IllegalArgumentException e) {
            keyBytes = secret.getBytes();
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Returns true if the token is valid (not expired, not tampered with).
     * @param token JWT string without the "Bearer " prefix
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warning("JWT token is expired: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warning("JWT token is unsupported: " + e.getMessage());
        } catch (MalformedJwtException e) {
            log.warning("JWT token is malformed: " + e.getMessage());
        } catch (io.jsonwebtoken.security.SignatureException e) {
            log.warning("JWT signature is invalid: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warning("JWT claims string is empty: " + e.getMessage());
        }
        return false;
    }

    /**
     * Extracts the userId (subject) from a valid JWT token.
     */
    public String getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    /**
     * Extracts a specific claim (e.g. "role", "email") from a valid token.
     */
    public String getClaim(String token, String claimKey) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get(claimKey, String.class);
    }
}
