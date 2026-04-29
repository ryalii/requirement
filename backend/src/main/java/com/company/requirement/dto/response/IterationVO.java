package com.company.requirement.dto.response;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class IterationVO {
    private Long id;
    private String name;
    private Long projectId;
    private String productName;
    private Long versionId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String description;
    private LocalDateTime createdAt;
}
