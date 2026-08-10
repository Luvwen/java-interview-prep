package com.javatheory.web.dto;

import com.javatheory.domain.Attempt;
import com.javatheory.domain.ModuleState;
import com.javatheory.domain.QuestionStats;
import com.javatheory.domain.Streak;

import java.util.List;
import java.util.Map;

public record ProgressResponse(Map<String, ModuleState> moduleStates, int overallPercent,
                               Map<String, QuestionStats> questionStats, List<Attempt> attempts,
                               Streak streak) {
}
