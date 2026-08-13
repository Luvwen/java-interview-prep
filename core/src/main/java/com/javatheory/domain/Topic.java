package com.javatheory.domain;

import java.util.List;

public record Topic(String id, String title, String content, List<String> examples,
                    List<TopicSection> sections) {
}
