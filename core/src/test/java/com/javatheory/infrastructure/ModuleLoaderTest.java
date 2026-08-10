package com.javatheory.infrastructure;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javatheory.domain.Module;
import com.javatheory.domain.QuestionType;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ModuleLoaderTest {

    private final ModuleLoader loader = new ModuleLoader(new ObjectMapper(), "fixtures/modules");

    @Test
    void loadsAllModulesFromIndex() {
        List<Module> modules = loader.loadAll();
        assertEquals(1, modules.size());
    }

    @Test
    void loadsModuleStructure() {
        Module module = loader.loadAll().get(0);
        assertEquals("sample", module.id());
        assertEquals("Sample Module", module.title());
        assertEquals(2, module.topics().size());
        assertEquals(2, module.quiz().questions().size());
        assertEquals(QuestionType.MULTIPLE, module.quiz().questions().get(1).type());
    }
}
