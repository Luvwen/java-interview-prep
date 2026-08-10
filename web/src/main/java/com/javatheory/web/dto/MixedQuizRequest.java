package com.javatheory.web.dto;

import java.util.List;

public record MixedQuizRequest(List<String> moduleIds, int count) {
}
