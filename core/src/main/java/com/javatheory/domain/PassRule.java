package com.javatheory.domain;

public final class PassRule {

    public static final int PASS_PERCENTAGE = 70;

    private PassRule() {
    }

    public static boolean passed(int score, int total) {
        if (total <= 0) {
            return false;
        }
        double percentage = (score * 100.0) / total;
        return percentage >= PASS_PERCENTAGE;
    }
}
