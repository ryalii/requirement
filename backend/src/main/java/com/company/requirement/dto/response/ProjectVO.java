package com.company.requirement.dto.response;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ProjectVO {
    private Long id;
    private String name;
    private String code;
    private String financeCode;
    private String owner;
    private String manager;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String description;
    private LocalDateTime createdAt;
    private int versionCount;
    private int iterationCount;
    private int memberCount;
    private int requirementCount;
}
