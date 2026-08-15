package com.javatheory.web.dto;

import com.javatheory.domain.LabStep;

public record LabStepDto(int line, String explanation) {

    public static LabStepDto fromStep(LabStep step) {
        return new LabStepDto(step.line(), step.explanation());
    }
}
