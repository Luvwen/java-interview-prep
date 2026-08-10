package com.javatheory.web.dto;

import com.javatheory.domain.Topic;

import java.util.List;

public record ModuleDetail(String id, String title, String description, List<Topic> topics) {
}
