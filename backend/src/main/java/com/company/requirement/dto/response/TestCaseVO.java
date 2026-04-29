package com.company.requirement.dto.response;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TestCaseVO {
    private Long id;
    private String code;
    private String name;
    private String status;
    private String priority;
    private LocalDate executedAt;
    private Long arId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
