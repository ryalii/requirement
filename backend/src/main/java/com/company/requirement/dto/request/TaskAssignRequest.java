package com.company.requirement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TaskAssignRequest {
    @NotBlank(message = "分配人不能为空")
    private String assignee;
}
