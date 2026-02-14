package com.productiv.workmanagement.risk;

import com.productiv.workmanagement.domain.entity.enums.RiskLevelBucket;

public final class RiskLevelBucketUtil {

    private RiskLevelBucketUtil() {
    }

    public static int toLevelScore(short probability, short impact) {
        return probability * impact;
    }

    public static RiskLevelBucket fromLevelScore(int levelScore) {
        if (levelScore >= 16) {
            return RiskLevelBucket.CRITICAL;
        }
        if (levelScore >= 10) {
            return RiskLevelBucket.HIGH;
        }
        if (levelScore >= 5) {
            return RiskLevelBucket.MEDIUM;
        }
        return RiskLevelBucket.LOW;
    }

    public static String toLegacySeverity(RiskLevelBucket bucket) {
        return bucket.name();
    }

    public static int minScore(RiskLevelBucket bucket) {
        return switch (bucket) {
            case LOW -> 1;
            case MEDIUM -> 5;
            case HIGH -> 10;
            case CRITICAL -> 16;
        };
    }

    public static int maxScore(RiskLevelBucket bucket) {
        return switch (bucket) {
            case LOW -> 4;
            case MEDIUM -> 9;
            case HIGH -> 15;
            case CRITICAL -> 25;
        };
    }
}
