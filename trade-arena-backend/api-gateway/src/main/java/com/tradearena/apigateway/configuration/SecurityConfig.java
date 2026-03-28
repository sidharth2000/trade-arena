package com.tradearena.apigateway.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {

        System.out.println("✅ SecurityConfig LOADED");

        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)

                // ✅ Disable default login + basic auth completely
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)

                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers("/auth/**").permitAll()
                        .pathMatchers("/notifications/**").permitAll()
                        .pathMatchers("/actuator/**").permitAll()
                        .anyExchange().permitAll()
                )
                .build();
    }
}