package com.jobflow.cooldown.util;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class CooldownUtil {

    public LocalDate calculateEligibleReapplyDate(LocalDate lastAppliedDate, Integer cooldownPeriod) {
        if (lastAppliedDate == null || cooldownPeriod == null || cooldownPeriod <= 0) {
            return null;
        }

        return lastAppliedDate.plusDays(cooldownPeriod);
    }

    public boolean isCooldownActive(LocalDate eligibleReapplyDate, LocalDate today) {
        return eligibleReapplyDate != null && today.isBefore(eligibleReapplyDate);
    }

    public long calculateDaysRemaining(LocalDate eligibleReapplyDate, LocalDate today) {
        if (eligibleReapplyDate == null || !today.isBefore(eligibleReapplyDate)) {
            return 0L;
        }

        return ChronoUnit.DAYS.between(today, eligibleReapplyDate);
    }
}
