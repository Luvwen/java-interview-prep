package com.javatheory.infrastructure;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javatheory.domain.Module;
import com.javatheory.domain.Question;
import com.javatheory.domain.QuestionType;
import com.javatheory.domain.Topic;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ModuleCatalogTest {

    private final ModuleLoader loader = new ModuleLoader(new ObjectMapper(), "modules");

    @Test
    void loadsAllFifteenModulesInOrder() {
        List<Module> modules = loader.loadAll();
        assertEquals(15, modules.size());
        assertEquals(List.of("core-java", "poo", "collections", "streams",
                "concurrency", "jvm", "testing", "sql-jdbc", "rest-http",
                "spring", "design-patterns", "git", "ai-development", "code-fill", "bug-hunt"),
                modules.stream().map(Module::id).toList());
    }

    @Test
    void everyModuleHasTopicsQuizAndValidQuestions() {
        for (Module module : loader.loadAll()) {
            assertFalse(module.title().isBlank(), module.id() + ": title");
            assertFalse(module.description().isBlank(), module.id() + ": description");
            assertFalse(module.topics().isEmpty(), module.id() + ": topics");
            assertFalse(module.quiz().questions().isEmpty(), module.id() + ": questions");

            for (Topic topic : module.topics()) {
                assertFalse(topic.title().isBlank(), module.id() + " topic title");
                assertFalse(topic.content().isBlank(), module.id() + " topic content");
            }

            for (Question question : module.quiz().questions()) {
                assertFalse(question.text().isBlank(), module.id() + " question text");
                assertFalse(question.explanation().isBlank(), module.id() + " question explanation");

                if (question.type() == QuestionType.CODE_FILL) {
                    assertFalse(question.codeTemplate().isBlank(),
                            module.id() + " question " + question.id() + " CODE_FILL must have codeTemplate");
                    assertFalse(question.blanks().isEmpty(),
                            module.id() + " question " + question.id() + " CODE_FILL must have blanks");
                } else if (question.type() == QuestionType.BUG_HUNT) {
                    assertFalse(question.code().isBlank(),
                            module.id() + " question " + question.id() + " BUG_HUNT must have code");
                    assertFalse(question.options().isEmpty(), module.id() + " question options");
                    assertFalse(question.correctIndexes().isEmpty(),
                            module.id() + " question " + question.id() + " BUG_HUNT must have correctIndexes");
                } else {
                    assertFalse(question.options().isEmpty(), module.id() + " question options");
                    for (Integer index : question.correctIndexes()) {
                        assertTrue(index >= 0 && index < question.options().size(),
                                module.id() + " question " + question.id() + " index out of bounds: " + index);
                    }
                }

                if (question.type() == QuestionType.TRUE_FALSE) {
                    assertEquals(List.of("Verdadero", "Falso"), question.options(),
                            module.id() + " question " + question.id() + " must have exactly two options");
                    assertEquals(1, question.correctIndexes().size(),
                            module.id() + " question " + question.id() + " must have one correct index");
                }
                if (question.type() == QuestionType.ORDER) {
                    assertTrue(question.options().size() >= 3,
                            module.id() + " question " + question.id() + " ORDER must have at least 3 options");
                    assertEquals(question.options().size(), question.correctIndexes().size(),
                            module.id() + " question " + question.id() + " ORDER correctIndexes must match options size");
                }
            }
        }
    }

    @Test
    void traditionalModulesHaveAtLeastTwoTrueFalseQuestions() {
        List<String> newTypeModules = List.of("code-fill", "bug-hunt");
        for (Module module : loader.loadAll()) {
            if (newTypeModules.contains(module.id())) {
                continue;
            }
            long trueFalse = module.quiz().questions().stream()
                    .filter(question -> question.type() == QuestionType.TRUE_FALSE)
                    .count();
            assertTrue(trueFalse >= 2, module.id() + " must have at least 2 TRUE_FALSE questions, got " + trueFalse);
        }
    }
}
