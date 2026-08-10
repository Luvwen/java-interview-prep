package com.javatheory.infrastructure;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javatheory.domain.Module;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

public class ModuleLoader {

    private final ObjectMapper mapper;
    private final String basePath;

    public ModuleLoader(ObjectMapper mapper) {
        this(mapper, "modules");
    }

    public ModuleLoader(ObjectMapper mapper, String basePath) {
        this.mapper = mapper;
        this.basePath = basePath;
    }

    public List<Module> loadAll() {
        List<String> files = readIndex();
        List<Module> modules = new ArrayList<>();
        for (String file : files) {
            try (InputStream in = open(basePath + "/" + file)) {
                modules.add(mapper.readValue(in, Module.class));
            } catch (IOException e) {
                throw new ContentLoadingException(e);
            }
        }
        return modules;
    }

    private List<String> readIndex() {
        try (InputStream in = open(basePath + "/index.json")) {
            return mapper.readValue(in, new TypeReference<List<String>>() {
            });
        } catch (IOException e) {
            throw new ContentLoadingException(e);
        }
    }

    private InputStream open(String path) throws IOException {
        InputStream in = getClass().getClassLoader().getResourceAsStream(path);
        if (in == null) {
            throw new IOException("Resource not found: " + path);
        }
        return in;
    }
}
