package com.company.requirement.dto.response;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class VersionVO {
    private Long id;
    private String productName;
    private Long projectId;
    private String versionNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String description;
    private LocalDateTime createdAt;
}
