package com.company.requirement.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OperationLogVO {
    private Long id;
    private String targetType;
    private Long targetId;
    private String action;
    private String operator;
    private LocalDateTime timestamp;
    private String oldValue;
    private String newValue;
    private String description;
}
