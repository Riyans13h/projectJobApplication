package com.jobflow.cooldown.service;

import com.jobflow.applications.entity.Application;
import com.jobflow.applications.enums.ApplicationStatus;
import com.jobflow.applications.repository.ApplicationRepository;
import com.jobflow.cooldown.dto.ApplyAnywayRequest;
import com.jobflow.cooldown.dto.CompanyCooldownResponse;
import com.jobflow.cooldown.dto.CooldownTemplateResponse;
import com.jobflow.cooldown.dto.CooldownResponse;
import com.jobflow.cooldown.dto.CreateCompanyCooldownRequest;
import com.jobflow.cooldown.entity.CompanyCooldown;
import com.jobflow.cooldown.repository.CompanyCooldownRepository;
import com.jobflow.cooldown.util.CooldownUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CooldownService {

    private final ApplicationRepository applicationRepository;
    private final CompanyCooldownRepository companyCooldownRepository;
    private final CooldownUtil cooldownUtil;

    private static final List<CooldownTemplateResponse> TEMPLATES = List.of(
            CooldownTemplateResponse.builder()
                    .name("Big tech")
                    .description("Longer reapply window for large companies")
                    .cooldownPeriod(180)
                    .build(),
            CooldownTemplateResponse.builder()
                    .name("Same role")
                    .description("Company and role-specific retry window")
                    .cooldownPeriod(90)
                    .build(),
            CooldownTemplateResponse.builder()
                    .name("Startup")
                    .description("Shorter follow-up cycle for fast-moving teams")
                    .cooldownPeriod(30)
                    .build(),
            CooldownTemplateResponse.builder()
                    .name("Rejected")
                    .description("Default cooldown after rejection")
                    .cooldownPeriod(180)
                    .build()
    );

    public CooldownResponse checkCooldown(String companyName, Long userId) {
        return checkCooldown(companyName, null, userId);
    }

    @Transactional(readOnly = true)
    public CooldownResponse checkCooldown(String companyName, String role, Long userId) {
        String normalizedCompany = companyName.trim();
        String normalizedRole = trimToNull(role);
        log.info("Checking cooldown for company: {} role: {} and user: {}", normalizedCompany, normalizedRole, userId);

        Optional<CompanyCooldown> manualCooldown = findManualCooldown(userId, normalizedCompany, normalizedRole);
        if (manualCooldown.isPresent()) {
            return toCooldownResponse(manualCooldown.get());
        }

        Optional<Application> latestApplication = findLatestApplication(userId, normalizedCompany, normalizedRole);

        if (latestApplication.isEmpty()) {
            return CooldownResponse.builder()
                    .companyName(normalizedCompany)
                    .role(normalizedRole)
                    .cooldownActive(false)
                    .daysRemaining(0L)
                    .message("No previous cooldown or application found for " + describeCompanyRole(normalizedCompany, normalizedRole) + ". You can apply.")
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
                .role(application.getRole())
                .lastAppliedDate(lastAppliedDate)
                .cooldownPeriod(cooldownPeriod)
                .eligibleReapplyDate(eligibleReapplyDate)
                .cooldownActive(cooldownActive)
                .daysRemaining(daysRemaining)
                .severity(resolveSeverity(daysRemaining, cooldownActive))
                .suggestedReapplyDate(eligibleReapplyDate)
                .message(buildMessage(application.getCompanyName(), application.getRole(), cooldownPeriod, eligibleReapplyDate,
                        cooldownActive, daysRemaining))
                .build();
    }

    public CompanyCooldownResponse createCompanyCooldown(CreateCompanyCooldownRequest request, Long userId) {
        String companyName = request.getCompanyName().trim();
        String role = trimToNull(request.getRole());
        LocalDate eligibleDate = request.getLastAppliedDate().plusDays(request.getCooldownPeriod());
        CompanyCooldown cooldown = findDuplicate(userId, companyName, role)
                .filter(existing -> Boolean.TRUE.equals(request.getUpdateExisting()))
                .orElseGet(() -> CompanyCooldown.builder()
                        .userId(userId)
                        .companyName(companyName)
                        .role(role)
                        .source("MANUAL")
                        .build());

        cooldown.setCompanyName(companyName);
        cooldown.setRole(role);
        cooldown.setLastAppliedDate(request.getLastAppliedDate());
        cooldown.setCooldownPeriod(request.getCooldownPeriod());
        cooldown.setEligibleReapplyDate(eligibleDate);
        if (cooldown.getSource() == null) {
            cooldown.setSource("MANUAL");
        }

        CompanyCooldown savedCooldown = companyCooldownRepository.save(cooldown);
        return toCompanyCooldownResponse(savedCooldown);
    }

    public List<CompanyCooldownResponse> createCompanyCooldowns(List<CreateCompanyCooldownRequest> requests, Long userId) {
        return requests.stream()
                .map(request -> createCompanyCooldown(request, userId))
                .toList();
    }

    public List<CompanyCooldownResponse> getActiveCompanyCooldowns(Long userId) {
        return companyCooldownRepository
                .findByUserIdAndEligibleReapplyDateAfterOrderByEligibleReapplyDateAsc(userId, LocalDate.now())
                .stream()
                .map(this::toCompanyCooldownResponse)
                .toList();
    }

    public List<CompanyCooldownResponse> getAlmostEligibleCooldowns(Long userId) {
        LocalDate today = LocalDate.now();
        return companyCooldownRepository
                .findByUserIdAndEligibleReapplyDateBetweenOrderByEligibleReapplyDateAsc(userId, today.plusDays(1), today.plusDays(14))
                .stream()
                .map(this::toCompanyCooldownResponse)
                .toList();
    }

    public List<CompanyCooldownResponse> getCooldownHistory(Long userId) {
        return companyCooldownRepository
                .findByUserIdAndEligibleReapplyDateLessThanEqualOrderByEligibleReapplyDateDesc(userId, LocalDate.now())
                .stream()
                .map(this::toCompanyCooldownResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CooldownTemplateResponse> getTemplates() {
        return TEMPLATES;
    }

    public CompanyCooldownResponse recordApplyAnyway(Long id, ApplyAnywayRequest request, Long userId) {
        CompanyCooldown cooldown = companyCooldownRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Cooldown not found"));

        cooldown.setApplyAnywayNote(request.getNote().trim());
        cooldown.setAppliedAnywayAt(LocalDateTime.now());
        return toCompanyCooldownResponse(companyCooldownRepository.save(cooldown));
    }

    public Optional<CompanyCooldownResponse> createRejectedApplicationCooldown(Application application) {
        if (application.getStatus() != ApplicationStatus.REJECTED || application.getCooldownPeriod() == null || application.getCooldownPeriod() <= 0) {
            return Optional.empty();
        }

        CreateCompanyCooldownRequest request = new CreateCompanyCooldownRequest();
        request.setCompanyName(application.getCompanyName());
        request.setRole(application.getRole());
        request.setLastAppliedDate(application.getApplicationDate());
        request.setCooldownPeriod(application.getCooldownPeriod());
        request.setUpdateExisting(true);

        CompanyCooldownResponse response = createCompanyCooldown(request, application.getUserId());
        companyCooldownRepository.findByIdAndUserId(response.getId(), application.getUserId())
                .ifPresent(cooldown -> {
                    cooldown.setSource("AUTO_REJECTED");
                    companyCooldownRepository.save(cooldown);
                });
        return Optional.of(response);
    }

    public void deleteCompanyCooldown(Long id, Long userId) {
        CompanyCooldown cooldown = companyCooldownRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Cooldown not found"));

        companyCooldownRepository.delete(cooldown);
    }

    private Optional<CompanyCooldown> findManualCooldown(Long userId, String companyName, String role) {
        if (role != null) {
            return companyCooldownRepository
                    .findFirstByUserIdAndCompanyNameIgnoreCaseAndRoleIgnoreCaseOrderByEligibleReapplyDateDesc(
                            userId, companyName, role)
                    .filter(this::isCompanyCooldownActive);
        }

        return companyCooldownRepository
                .findFirstByUserIdAndCompanyNameIgnoreCaseAndRoleIsNullOrderByEligibleReapplyDateDesc(userId, companyName)
                .filter(this::isCompanyCooldownActive);
    }

    private Optional<CompanyCooldown> findDuplicate(Long userId, String companyName, String role) {
        if (role == null) {
            return companyCooldownRepository
                    .findFirstByUserIdAndCompanyNameIgnoreCaseAndRoleIsNullOrderByEligibleReapplyDateDesc(userId, companyName);
        }

        return companyCooldownRepository.findFirstByUserIdAndCompanyNameIgnoreCaseAndRoleIgnoreCaseOrderByEligibleReapplyDateDesc(
                userId, companyName, role);
    }

    private Optional<Application> findLatestApplication(Long userId, String companyName, String role) {
        if (role != null) {
            return applicationRepository
                    .findFirstByUserIdAndCompanyNameIgnoreCaseAndRoleIgnoreCaseOrderByApplicationDateDescCreatedAtDesc(
                            userId, companyName, role);
        }

        return applicationRepository.findFirstByUserIdAndCompanyNameIgnoreCaseOrderByApplicationDateDescCreatedAtDesc(
                userId, companyName);
    }

    private boolean isCompanyCooldownActive(CompanyCooldown cooldown) {
        return cooldown.getEligibleReapplyDate() != null && LocalDate.now().isBefore(cooldown.getEligibleReapplyDate());
    }

    private CompanyCooldownResponse toCompanyCooldownResponse(CompanyCooldown cooldown) {
        long daysRemaining = cooldownUtil.calculateDaysRemaining(cooldown.getEligibleReapplyDate(), LocalDate.now());
        boolean active = isCompanyCooldownActive(cooldown);
        return CompanyCooldownResponse.builder()
                .id(cooldown.getId())
                .companyName(cooldown.getCompanyName())
                .role(cooldown.getRole())
                .lastAppliedDate(cooldown.getLastAppliedDate())
                .cooldownPeriod(cooldown.getCooldownPeriod())
                .eligibleReapplyDate(cooldown.getEligibleReapplyDate())
                .cooldownActive(active)
                .daysRemaining(daysRemaining)
                .severity(resolveSeverity(daysRemaining, active))
                .suggestedReapplyDate(cooldown.getEligibleReapplyDate())
                .message(buildMessage(cooldown.getCompanyName(), cooldown.getRole(), cooldown.getCooldownPeriod(),
                        cooldown.getEligibleReapplyDate(), active, daysRemaining))
                .applyAnywayNote(cooldown.getApplyAnywayNote())
                .appliedAnywayAt(cooldown.getAppliedAnywayAt())
                .source(cooldown.getSource())
                .createdAt(cooldown.getCreatedAt())
                .build();
    }

    private CooldownResponse toCooldownResponse(CompanyCooldown cooldown) {
        long daysRemaining = cooldownUtil.calculateDaysRemaining(cooldown.getEligibleReapplyDate(), LocalDate.now());
        return CooldownResponse.builder()
                .companyName(cooldown.getCompanyName())
                .role(cooldown.getRole())
                .lastAppliedDate(cooldown.getLastAppliedDate())
                .cooldownPeriod(cooldown.getCooldownPeriod())
                .eligibleReapplyDate(cooldown.getEligibleReapplyDate())
                .cooldownActive(true)
                .daysRemaining(daysRemaining)
                .severity(resolveSeverity(daysRemaining, true))
                .suggestedReapplyDate(cooldown.getEligibleReapplyDate())
                .message(buildMessage(cooldown.getCompanyName(), cooldown.getRole(), cooldown.getCooldownPeriod(),
                        cooldown.getEligibleReapplyDate(), true, daysRemaining))
                .build();
    }

    private String buildMessage(
            String companyName,
            String role,
            Integer cooldownPeriod,
            LocalDate eligibleReapplyDate,
            boolean cooldownActive,
            long daysRemaining) {
        String target = describeCompanyRole(companyName, role);
        if (cooldownPeriod == null || cooldownPeriod <= 0) {
            return "Previous application found for " + target + ", but no cooldown period is configured.";
        }

        if (cooldownActive) {
            return "Cooldown warning: wait " + daysRemaining + " day(s) before reapplying to "
                    + target + ". Eligible reapply date is " + eligibleReapplyDate + ".";
        }

        return "Cooldown complete for " + target + ". You can reapply.";
    }

    private String resolveSeverity(long daysRemaining, boolean active) {
        if (!active) {
            return "COMPLETE";
        }
        if (daysRemaining > 60) {
            return "HIGH";
        }
        if (daysRemaining >= 15) {
            return "MEDIUM";
        }
        return "LOW";
    }

    private String describeCompanyRole(String companyName, String role) {
        return role == null ? companyName : companyName + " - " + role;
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
