package com.company.requirement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TaskStatusRequest {
    @NotBlank(message = "状态不能为空")
    private String status;
}
