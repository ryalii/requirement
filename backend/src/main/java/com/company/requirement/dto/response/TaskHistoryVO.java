package com.company.requirement.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskHistoryVO {
    private Long id;
    private Long taskId;
    private String action;
    private String operator;
    private LocalDateTime timestamp;
    private String oldValue;
    private String newValue;
    private String description;
}
