package com.company.requirement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TaskCreateRequest {
    @NotBlank(message = "任务名称不能为空")
    private String name;

    @NotBlank(message = "任务类型不能为空")
    private String type;

    private String assignee;

    @NotBlank(message = "创建人不能为空")
    private String creator;

    @NotNull(message = "截止日期不能为空")
    private String deadline;

    private String description;
    private Long relatedRequirementId;
}
