package com.tradearena.notificationservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * AsyncConfig
 *
 * Enables Spring's @Async support used by EmailService.
 * Emails are sent on a separate thread pool so they do not
 * block the SSE push or the HTTP response back to the calling service.
 *
 * Thread pool sizing:
 *  - Core pool: 2  (always running, ready for email tasks)
 *  - Max pool:  10 (burst capacity during high auction activity)
 *  - Queue:     500 (buffer if all threads are busy)
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "emailTaskExecutor")
    public Executor emailTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("email-async-");
        executor.initialize();
        return executor;
    }
}
