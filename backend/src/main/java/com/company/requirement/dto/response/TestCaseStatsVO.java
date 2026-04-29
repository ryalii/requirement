package com.company.requirement.dto.response;

import lombok.Data;

@Data
public class TestCaseStatsVO {
    private long total;
    private long passed;
    private long failed;
    private long pending;
    private double passRate;
    private double executionRate;
}
