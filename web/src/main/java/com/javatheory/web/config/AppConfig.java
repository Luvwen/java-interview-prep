package com.javatheory.web.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javatheory.application.ModuleService;
import com.javatheory.application.ProgressService;
import com.javatheory.application.QuizService;
import com.javatheory.application.LaboratoryService;
import com.javatheory.application.RealWorldService;
import com.javatheory.application.StatisticsService;
import com.javatheory.infrastructure.ModuleLoader;
import com.javatheory.infrastructure.ProgressRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class AppConfig {

    @Value("${javatheory.progress:}")
    private String progressFile;

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }

    @Bean
    public ModuleService moduleService(ObjectMapper mapper) {
        return new ModuleService(new ModuleLoader(mapper));
    }

    @Bean
    public QuizService quizService(ModuleService moduleService) {
        return new QuizService(moduleService);
    }

    @Bean
    public ProgressService progressService(ObjectMapper mapper) {
        ProgressRepository repository = progressFile == null || progressFile.isBlank()
                ? new ProgressRepository(mapper)
                : new ProgressRepository(mapper, Path.of(progressFile));
        return new ProgressService(repository);
    }

    @Bean
    public StatisticsService statisticsService(ModuleService moduleService, ProgressService progressService) {
        return new StatisticsService(moduleService, progressService);
    }

    @Bean
    public RealWorldService realWorldService(ObjectMapper mapper) {
        return new RealWorldService(mapper);
    }

    @Bean
    public LaboratoryService laboratoryService(ObjectMapper mapper) {
        return new LaboratoryService(mapper);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:5174", "http://127.0.0.1:5174")
                        .allowedMethods("GET", "POST", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }
}
