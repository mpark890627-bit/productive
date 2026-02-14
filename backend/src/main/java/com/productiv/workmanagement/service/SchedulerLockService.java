package com.productiv.workmanagement.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class SchedulerLockService {

    private final JdbcTemplate jdbcTemplate;

    public SchedulerLockService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean tryLock(long lockKey) {
        Boolean acquired = jdbcTemplate.queryForObject("SELECT pg_try_advisory_lock(?)", Boolean.class, lockKey);
        return Boolean.TRUE.equals(acquired);
    }

    public void unlock(long lockKey) {
        jdbcTemplate.queryForObject("SELECT pg_advisory_unlock(?)", Boolean.class, lockKey);
    }
}
