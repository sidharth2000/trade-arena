package com.tradearena.notificationservice.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Base64;
import java.util.logging.Logger;

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

    public String getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public String getClaim(String token, String claimKey) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get(claimKey, String.class);
    }
}
