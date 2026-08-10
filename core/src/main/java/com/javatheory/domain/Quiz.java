package com.javatheory.domain;

import java.util.List;

public record Quiz(String id, List<Question> questions) {
}
