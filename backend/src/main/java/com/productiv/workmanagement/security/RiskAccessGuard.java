package com.productiv.workmanagement.security;

import com.productiv.workmanagement.domain.entity.Risk;
import com.productiv.workmanagement.domain.repository.RiskRepository;
import com.productiv.workmanagement.global.ForbiddenException;
import com.productiv.workmanagement.global.ResourceNotFoundException;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class RiskAccessGuard {

    private final RiskRepository riskRepository;

    public RiskAccessGuard(RiskRepository riskRepository) {
        this.riskRepository = riskRepository;
    }

    @Transactional(readOnly = true)
    public Risk getOwnedRiskOrThrow(UUID currentUserId, UUID riskId) {
        return riskRepository.findByIdAndProject_OwnerUser_Id(riskId, currentUserId)
            .orElseGet(() -> {
                if (riskRepository.existsById(riskId)) {
                    throw new ForbiddenException("You do not have access to this risk.");
                }
                throw new ResourceNotFoundException("Risk not found: " + riskId);
            });
    }
}
