package com.javatheory.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javatheory.domain.RealWorldCase;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

public class RealWorldService {

    private final ObjectMapper mapper;

    public RealWorldService(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    public List<RealWorldCase> loadCases() {
        try (InputStream in = getClass().getClassLoader().getResourceAsStream("modules/real-world.json")) {
            if (in == null) {
                return List.of();
            }
            var wrapper = mapper.readValue(in, RealWorldWrapper.class);
            return wrapper.cases() != null ? wrapper.cases() : List.of();
        } catch (IOException e) {
            return List.of();
        }
    }

    private record RealWorldWrapper(String id, String title, String description,
                                    List<RealWorldCase> cases) {
    }
}
