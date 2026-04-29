package com.company.requirement.dto.request;

import lombok.Data;

@Data
public class TaskUpdateRequest {
    private String name;
    private String type;
    private String assignee;
    private String deadline;
    private String description;
    private Long relatedRequirementId;
}
