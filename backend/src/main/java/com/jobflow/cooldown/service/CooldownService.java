package com.jobflow.cooldown.service;

import com.jobflow.applications.entity.Application;
import com.jobflow.applications.repository.ApplicationRepository;
import com.jobflow.cooldown.dto.CooldownResponse;
import com.jobflow.cooldown.util.CooldownUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CooldownService {

    private final ApplicationRepository applicationRepository;
    private final CooldownUtil cooldownUtil;

    public CooldownResponse checkCooldown(String companyName, Long userId) {
        String normalizedCompany = companyName.trim();
        log.info("Checking cooldown for company: {} and user: {}", normalizedCompany, userId);

        Optional<Application> latestApplication = applicationRepository
                .findFirstByUserIdAndCompanyNameIgnoreCaseOrderByApplicationDateDescCreatedAtDesc(
                        userId, normalizedCompany);

        if (latestApplication.isEmpty()) {
            return CooldownResponse.builder()
                    .companyName(normalizedCompany)
                    .cooldownActive(false)
                    .daysRemaining(0L)
                    .message("No previous application found for " + normalizedCompany + ". You can apply.")
                    .build();
        }

        Application application = latestApplication.get();
        Integer cooldownPeriod = application.getCooldownPeriod();
        LocalDate lastAppliedDate = application.getApplicationDate();
        LocalDate eligibleReapplyDate = cooldownUtil.calculateEligibleReapplyDate(lastAppliedDate, cooldownPeriod);
        LocalDate today = LocalDate.now();
        boolean cooldownActive = cooldownUtil.isCooldownActive(eligibleReapplyDate, today);
        long daysRemaining = cooldownUtil.calculateDaysRemaining(eligibleReapplyDate, today);

        return CooldownResponse.builder()
                .companyName(application.getCompanyName())
                .lastAppliedDate(lastAppliedDate)
                .cooldownPeriod(cooldownPeriod)
                .eligibleReapplyDate(eligibleReapplyDate)
                .cooldownActive(cooldownActive)
                .daysRemaining(daysRemaining)
                .message(buildMessage(application.getCompanyName(), cooldownPeriod, eligibleReapplyDate,
                        cooldownActive, daysRemaining))
                .build();
    }

    private String buildMessage(
            String companyName,
            Integer cooldownPeriod,
            LocalDate eligibleReapplyDate,
            boolean cooldownActive,
            long daysRemaining) {
        if (cooldownPeriod == null || cooldownPeriod <= 0) {
            return "Previous application found for " + companyName + ", but no cooldown period is configured.";
        }

        if (cooldownActive) {
            return "Cooldown warning: wait " + daysRemaining + " day(s) before reapplying to "
                    + companyName + ". Eligible reapply date is " + eligibleReapplyDate + ".";
        }

        return "Cooldown complete for " + companyName + ". You can reapply.";
    }
}
