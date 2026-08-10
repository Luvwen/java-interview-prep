package com.javatheory.presentation;

import com.javatheory.domain.Module;
import com.javatheory.domain.Topic;

import java.io.PrintStream;

public class ModuleView {

    private final PrintStream out;

    public ModuleView(PrintStream out) {
        this.out = out;
    }

    public void show(Module module) {
        out.println("=== " + module.title() + " ===");
        out.println(module.description());
        out.println();
        for (Topic topic : module.topics()) {
            out.println("# " + topic.title());
            out.println(topic.content());
            if (!topic.examples().isEmpty()) {
                out.println("Ejemplos:");
                for (String example : topic.examples()) {
                    out.println("  - " + example);
                }
            }
            out.println();
        }
    }
}
