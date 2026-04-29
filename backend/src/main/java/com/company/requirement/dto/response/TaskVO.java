package com.company.requirement.dto.response;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TaskVO {
    private Long id;
    private String code;
    private String name;
    private String type;
    private String assignee;
    private String creator;
    private LocalDate deadline;
    private String status;
    private String description;
    private Long relatedRequirementId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long daysRemaining;
    private boolean isOverdue;
    private List<TaskHistoryVO> histories;
}
