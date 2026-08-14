package com.javatheory.web.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final RateLimitInterceptor rateLimitInterceptor = new RateLimitInterceptor();

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET")
                .allowedHeaders("*")
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/api/**");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource resource = location.createRelative(resourcePath);
                        return resource.exists() && resource.isReadable() ? resource
                                : new ClassPathResource("/static/index.html");
                    }
                });
    }

    private static class RateLimitInterceptor implements HandlerInterceptor {
        private final Map<String, RequestCounter> clients = new ConcurrentHashMap<>();
        private static final int MAX_REQUESTS_PER_MINUTE = 60;

        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
            String ip = getClientIp(request);
            RequestCounter counter = clients.computeIfAbsent(ip, k -> new RequestCounter());

            if (counter.isBlocked()) {
                response.setStatus(429);
                response.setHeader("Retry-After", "60");
                return false;
            }

            counter.increment();
            response.setHeader("X-RateLimit-Limit", String.valueOf(MAX_REQUESTS_PER_MINUTE));
            response.setHeader("X-RateLimit-Remaining", String.valueOf(counter.remaining()));
            return true;
        }

        private String getClientIp(HttpServletRequest request) {
            String xff = request.getHeader("X-Forwarded-For");
            return xff != null ? xff.split(",")[0].trim() : request.getRemoteAddr();
        }

        private static class RequestCounter {
            private volatile long windowStart = System.currentTimeMillis();
            private final AtomicInteger count = new AtomicInteger(0);

            void increment() {
                resetIfNeeded();
                count.incrementAndGet();
            }

            boolean isBlocked() {
                resetIfNeeded();
                return count.get() > MAX_REQUESTS_PER_MINUTE;
            }

            int remaining() {
                resetIfNeeded();
                return Math.max(0, MAX_REQUESTS_PER_MINUTE - count.get());
            }

            private void resetIfNeeded() {
                long now = System.currentTimeMillis();
                if (now - windowStart > 60_000) {
                    windowStart = now;
                    count.set(0);
                }
            }
        }
    }
}
