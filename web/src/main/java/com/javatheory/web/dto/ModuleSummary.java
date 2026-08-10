package com.javatheory.web.dto;

import com.javatheory.domain.ModuleState;

public record ModuleSummary(String id, String title, String description, ModuleState state) {
}
