package com.javatheory.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDate;

@JsonIgnoreProperties(ignoreUnknown = true)
public record Streak(int current, String lastDate, String challengeDate) {

    public Streak() {
        this(0, null, null);
    }

    public boolean isChallengeCompletedToday() {
        return LocalDate.now().toString().equals(challengeDate);
    }

    public boolean isStreakActive() {
        if (lastDate == null) return false;
        LocalDate last = LocalDate.parse(lastDate);
        return last.equals(LocalDate.now()) || last.equals(LocalDate.now().minusDays(1));
    }

    public Streak recordDay() {
        LocalDate today = LocalDate.now();
        int newCurrent;
        if (lastDate != null) {
            LocalDate last = LocalDate.parse(lastDate);
            if (last.equals(today.minusDays(1))) {
                newCurrent = current + 1;
            } else if (last.equals(today)) {
                newCurrent = current;
            } else {
                newCurrent = 1;
            }
        } else {
            newCurrent = 1;
        }
        return new Streak(newCurrent, today.toString(), today.toString());
    }
}
