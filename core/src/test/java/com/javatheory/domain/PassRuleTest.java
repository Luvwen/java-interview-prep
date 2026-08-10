package com.javatheory.domain;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PassRuleTest {

    @Test
    void passesAtExactlySeventyPercent() {
        assertTrue(PassRule.passed(7, 10));
    }

    @Test
    void failsBelowSeventyPercent() {
        assertFalse(PassRule.passed(6, 10));
    }

    @Test
    void passesAtOneHundredPercent() {
        assertTrue(PassRule.passed(3, 3));
    }

    @Test
    void failsWhenTotalIsZero() {
        assertFalse(PassRule.passed(0, 0));
    }
}
