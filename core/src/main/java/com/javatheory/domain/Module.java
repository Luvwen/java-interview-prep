package com.javatheory.domain;

import java.util.List;

public record Module(String id, String title, String description,
                     List<Topic> topics, Quiz quiz) {
}
