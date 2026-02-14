package com.productiv.workmanagement.service;

import com.productiv.workmanagement.domain.entity.Project;
import com.productiv.workmanagement.domain.entity.Risk;
import com.productiv.workmanagement.domain.entity.RiskTag;
import com.productiv.workmanagement.domain.entity.User;
import com.productiv.workmanagement.domain.entity.enums.RiskLevelBucket;
import com.productiv.workmanagement.domain.entity.enums.RiskStatus;
import com.productiv.workmanagement.domain.repository.RiskRepository;
import com.productiv.workmanagement.domain.repository.UserRepository;
import com.productiv.workmanagement.global.ResourceNotFoundException;
import com.productiv.workmanagement.risk.RiskLevelBucketUtil;
import com.productiv.workmanagement.security.RiskAccessGuard;
import com.productiv.workmanagement.web.dto.risk.RiskCreateRequest;
import com.productiv.workmanagement.web.dto.risk.RiskMatrixCellResponse;
import com.productiv.workmanagement.web.dto.risk.RiskMatrixSummaryResponse;
import com.productiv.workmanagement.web.dto.risk.RiskResponse;
import com.productiv.workmanagement.web.dto.risk.RiskSummaryResponse;
import com.productiv.workmanagement.web.dto.risk.RiskUpdateRequest;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RiskService {

    private final RiskRepository riskRepository;
    private final UserRepository userRepository;
    private final ProjectService projectService;
    private final ActivityLogService activityLogService;
    private final RiskAccessGuard riskAccessGuard;
    private final RiskActionService riskActionService;

    public RiskService(
        RiskRepository riskRepository,
        UserRepository userRepository,
        ProjectService projectService,
        ActivityLogService activityLogService,
        RiskAccessGuard riskAccessGuard,
        RiskActionService riskActionService
    ) {
        this.riskRepository = riskRepository;
        this.userRepository = userRepository;
        this.projectService = projectService;
        this.activityLogService = activityLogService;
        this.riskAccessGuard = riskAccessGuard;
        this.riskActionService = riskActionService;
    }

    public RiskResponse create(UUID currentUserId, UUID projectId, RiskCreateRequest request) {
        Project project = projectService.getOwnedProject(currentUserId, projectId);

        short probability = request.probability() == null ? 3 : request.probability();
        short impact = request.impact() == null ? 3 : request.impact();
        int levelScore = RiskLevelBucketUtil.toLevelScore(probability, impact);
        RiskLevelBucket levelBucket = RiskLevelBucketUtil.fromLevelScore(levelScore);

        Risk risk = new Risk();
        risk.setProject(project);
        risk.setTitle(request.title().trim());
        risk.setDescription(trimToNull(request.description()));
        risk.setCategory(trimToNull(request.category()));
        risk.setStatus(request.status() == null ? RiskStatus.IDENTIFIED : request.status());
        risk.setProbability(probability);
        risk.setImpact(impact);
        risk.setLevelScore(levelScore);
        risk.setOwnerUser(resolveOwnerUser(request.ownerUserId()));
        risk.setNextReviewDate(request.nextReviewDate());
        risk.setMitigationPlan(trimToNull(request.mitigationPlan()));
        risk.setContingencyPlan(trimToNull(request.contingencyPlan()));
        risk.setTriggers(trimToNull(request.triggers()));
        risk.setSeverity(RiskLevelBucketUtil.toLegacySeverity(levelBucket));

        if (risk.getStatus() == RiskStatus.CLOSED) {
            risk.setClosedAt(Instant.now());
        }

        Risk saved = riskRepository.save(risk);

        activityLogService.log(
            currentUserId,
            "RISK",
            saved.getId(),
            "RISK_CREATED",
            Map.of(
                "riskId", saved.getId().toString(),
                "projectId", projectId.toString(),
                "status", saved.getStatus().name(),
                "levelScore", saved.getLevelScore()
            )
        );

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<RiskResponse> getAllInProject(
        UUID currentUserId,
        UUID projectId,
        RiskStatus status,
        RiskLevelBucket levelBucket,
        Short probability,
        Short impact,
        UUID ownerUserId,
        String keyword,
        UUID tagId,
        Pageable pageable
    ) {
        projectService.getOwnedProject(currentUserId, projectId);
        Specification<Risk> spec = buildFilterSpec(projectId, status, levelBucket, probability, impact, ownerUserId, keyword, tagId);
        return riskRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public RiskResponse getById(UUID currentUserId, UUID riskId) {
        return toResponse(riskAccessGuard.getOwnedRiskOrThrow(currentUserId, riskId));
    }

    public RiskResponse patch(UUID currentUserId, UUID riskId, RiskUpdateRequest request) {
        Risk risk = riskAccessGuard.getOwnedRiskOrThrow(currentUserId, riskId);
        RiskStatus beforeStatus = risk.getStatus();
        Map<String, Object> changes = new LinkedHashMap<>();

        if (request.title() != null) {
            String normalizedTitle = request.title().trim();
            if (normalizedTitle.isEmpty()) {
                throw new IllegalArgumentException("Risk title must not be blank");
            }
            putChange(changes, "title", risk.getTitle(), normalizedTitle);
            risk.setTitle(normalizedTitle);
        }
        if (request.description() != null) {
            String next = trimToNull(request.description());
            putChange(changes, "description", risk.getDescription(), next);
            risk.setDescription(next);
        }
        if (request.category() != null) {
            String next = trimToNull(request.category());
            putChange(changes, "category", risk.getCategory(), next);
            risk.setCategory(next);
        }
        if (request.status() != null) {
            putChange(changes, "status", risk.getStatus(), request.status());
            risk.setStatus(request.status());
        }
        if (request.ownerUserId() != null) {
            User owner = resolveOwnerUser(request.ownerUserId());
            putChange(changes, "ownerUserId", risk.getOwnerUser() == null ? null : risk.getOwnerUser().getId(), owner.getId());
            risk.setOwnerUser(owner);
        }
        if (request.nextReviewDate() != null) {
            putChange(changes, "nextReviewDate", risk.getNextReviewDate(), request.nextReviewDate());
            risk.setNextReviewDate(request.nextReviewDate());
        }
        if (request.mitigationPlan() != null) {
            String next = trimToNull(request.mitigationPlan());
            putChange(changes, "mitigationPlan", risk.getMitigationPlan(), next);
            risk.setMitigationPlan(next);
        }
        if (request.contingencyPlan() != null) {
            String next = trimToNull(request.contingencyPlan());
            putChange(changes, "contingencyPlan", risk.getContingencyPlan(), next);
            risk.setContingencyPlan(next);
        }
        if (request.triggers() != null) {
            String next = trimToNull(request.triggers());
            putChange(changes, "triggers", risk.getTriggers(), next);
            risk.setTriggers(next);
        }

        if (request.probability() != null) {
            putChange(changes, "probability", risk.getProbability(), request.probability());
            risk.setProbability(request.probability());
        }
        if (request.impact() != null) {
            putChange(changes, "impact", risk.getImpact(), request.impact());
            risk.setImpact(request.impact());
        }
        if (request.probability() != null || request.impact() != null) {
            int nextLevelScore = RiskLevelBucketUtil.toLevelScore(risk.getProbability(), risk.getImpact());
            putChange(changes, "levelScore", risk.getLevelScore(), nextLevelScore);
            risk.setLevelScore(nextLevelScore);
            risk.setSeverity(RiskLevelBucketUtil.toLegacySeverity(RiskLevelBucketUtil.fromLevelScore(nextLevelScore)));
        }

        if (risk.getStatus() == RiskStatus.CLOSED && risk.getClosedAt() == null) {
            risk.setClosedAt(Instant.now());
        } else if (risk.getStatus() != RiskStatus.CLOSED) {
            risk.setClosedAt(null);
        }

        Risk saved = riskRepository.save(risk);

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("riskId", saved.getId().toString());
        meta.put("projectId", saved.getProject().getId().toString());
        meta.put("changes", changes);

        if (request.status() != null && beforeStatus != request.status()) {
            activityLogService.log(currentUserId, "RISK", saved.getId(), "RISK_STATUS_CHANGED", meta);
        } else {
            activityLogService.log(currentUserId, "RISK", saved.getId(), "RISK_UPDATED", meta);
        }

        return toResponse(saved);
    }

    public RiskResponse close(UUID currentUserId, UUID riskId) {
        Risk risk = riskAccessGuard.getOwnedRiskOrThrow(currentUserId, riskId);
        RiskStatus beforeStatus = risk.getStatus();
        risk.setStatus(RiskStatus.CLOSED);
        risk.setClosedAt(Instant.now());
        Risk saved = riskRepository.save(risk);

        activityLogService.log(
            currentUserId,
            "RISK",
            saved.getId(),
            "RISK_CLOSED",
            Map.of(
                "riskId", saved.getId().toString(),
                "projectId", saved.getProject().getId().toString(),
                "beforeStatus", beforeStatus.name(),
                "afterStatus", RiskStatus.CLOSED.name()
            )
        );

        return toResponse(saved);
    }

    public void delete(UUID currentUserId, UUID riskId) {
        Risk risk = riskAccessGuard.getOwnedRiskOrThrow(currentUserId, riskId);
        riskRepository.delete(risk);
    }

    @Transactional(readOnly = true)
    public RiskSummaryResponse getSummary(UUID currentUserId, UUID projectId) {
        projectService.getOwnedProject(currentUserId, projectId);

        Map<String, Long> statusCounts = new LinkedHashMap<>();
        for (Object[] row : riskRepository.countByStatusInProject(projectId)) {
            statusCounts.put(String.valueOf(row[0]), ((Long) row[1]));
        }

        Map<String, Long> levelCounts = new LinkedHashMap<>();
        for (RiskLevelBucket bucket : RiskLevelBucket.values()) {
            levelCounts.put(bucket.name(), 0L);
        }
        for (Integer score : riskRepository.findLevelScoresByProjectId(projectId)) {
            RiskLevelBucket bucket = RiskLevelBucketUtil.fromLevelScore(score == null ? 1 : score);
            levelCounts.put(bucket.name(), levelCounts.get(bucket.name()) + 1);
        }

        long overdueActionsCount = riskActionService.countOverdueActions(projectId);
        return new RiskSummaryResponse(statusCounts, levelCounts, overdueActionsCount);
    }

    @Transactional(readOnly = true)
    public RiskMatrixSummaryResponse getMatrixSummary(
        UUID currentUserId,
        UUID projectId,
        RiskStatus status,
        RiskLevelBucket levelBucket,
        UUID ownerUserId,
        String keyword,
        UUID tagId
    ) {
        projectService.getOwnedProject(currentUserId, projectId);
        Specification<Risk> spec = buildFilterSpec(projectId, status, levelBucket, null, null, ownerUserId, keyword, tagId);
        List<Risk> risks = riskRepository.findAll(spec);

        long[][] matrix = new long[6][6];
        for (Risk risk : risks) {
            short p = risk.getProbability();
            short i = risk.getImpact();
            if (p >= 1 && p <= 5 && i >= 1 && i <= 5) {
                matrix[p][i] += 1;
            }
        }

        List<RiskMatrixCellResponse> cells = new java.util.ArrayList<>();
        for (short p = 1; p <= 5; p++) {
            for (short i = 1; i <= 5; i++) {
                cells.add(new RiskMatrixCellResponse(p, i, matrix[p][i]));
            }
        }
        return new RiskMatrixSummaryResponse(cells);
    }

    @Transactional(readOnly = true)
    public Risk getOwnedRisk(UUID currentUserId, UUID riskId) {
        return riskAccessGuard.getOwnedRiskOrThrow(currentUserId, riskId);
    }

    private RiskResponse toResponse(Risk risk) {
        UUID ownerUserId = risk.getOwnerUser() == null ? null : risk.getOwnerUser().getId();
        String ownerUserName = risk.getOwnerUser() == null ? null : risk.getOwnerUser().getName();
        RiskLevelBucket levelBucket = RiskLevelBucketUtil.fromLevelScore(risk.getLevelScore());

        return new RiskResponse(
            risk.getId(),
            risk.getProject().getId(),
            risk.getTitle(),
            risk.getDescription(),
            risk.getCategory(),
            risk.getStatus(),
            risk.getProbability(),
            risk.getImpact(),
            risk.getLevelScore(),
            levelBucket,
            ownerUserId,
            ownerUserName,
            risk.getNextReviewDate(),
            risk.getMitigationPlan(),
            risk.getContingencyPlan(),
            risk.getTriggers(),
            risk.getClosedAt(),
            risk.getCreatedAt(),
            risk.getUpdatedAt()
        );
    }

    private Specification<Risk> projectEquals(UUID projectId) {
        return (root, query, cb) -> cb.equal(root.get("project").get("id"), projectId);
    }

    private Specification<Risk> buildFilterSpec(
        UUID projectId,
        RiskStatus status,
        RiskLevelBucket levelBucket,
        Short probability,
        Short impact,
        UUID ownerUserId,
        String keyword,
        UUID tagId
    ) {
        Specification<Risk> spec = Specification.where(projectEquals(projectId));
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (levelBucket != null) {
            int min = RiskLevelBucketUtil.minScore(levelBucket);
            int max = RiskLevelBucketUtil.maxScore(levelBucket);
            spec = spec.and((root, query, cb) -> cb.between(root.get("levelScore"), min, max));
        }
        if (probability != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("probability"), probability));
        }
        if (impact != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("impact"), impact));
        }
        if (ownerUserId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("ownerUser").get("id"), ownerUserId));
        }
        String keywordPattern = normalizeKeywordPattern(keyword);
        if (keywordPattern != null) {
            spec = spec.and((root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), keywordPattern),
                cb.like(cb.lower(cb.coalesce(root.get("description"), "")), keywordPattern)
            ));
        }
        if (tagId != null) {
            spec = spec.and((root, query, cb) -> {
                query.distinct(true);
                var subquery = query.subquery(UUID.class);
                var riskTagRoot = subquery.from(RiskTag.class);
                subquery.select(riskTagRoot.get("risk").get("id"))
                    .where(
                        cb.equal(riskTagRoot.get("risk").get("id"), root.get("id")),
                        cb.equal(riskTagRoot.get("tag").get("id"), tagId)
                    );
                return cb.exists(subquery);
            });
        }
        return spec;
    }

    private User resolveOwnerUser(UUID ownerUserId) {
        if (ownerUserId == null) {
            return null;
        }
        return userRepository.findById(ownerUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + ownerUserId));
    }

    private String normalizeKeywordPattern(String keyword) {
        if (keyword == null) {
            return null;
        }
        String normalized = keyword.trim().toLowerCase();
        if (normalized.isEmpty()) {
            return null;
        }
        return "%" + normalized + "%";
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void putChange(Map<String, Object> changes, String key, Object before, Object after) {
        if (!Objects.equals(before, after)) {
            changes.put(key, Map.of("before", before, "after", after));
        }
    }
}
