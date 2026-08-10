package com.javatheory.application;

import com.javatheory.domain.Module;
import com.javatheory.domain.Quiz;
import com.javatheory.infrastructure.ModuleLoader;

import java.util.List;
import java.util.Optional;

public class ModuleService {

    private final List<Module> modules;

    public ModuleService(ModuleLoader loader) {
        this.modules = loader.loadAll();
    }

    public List<Module> listModules() {
        return modules;
    }

    public Optional<Module> findById(String id) {
        return modules.stream().filter(module -> module.id().equals(id)).findFirst();
    }

    public Optional<Quiz> findQuiz(String moduleId) {
        return findById(moduleId).map(Module::quiz);
    }
}
