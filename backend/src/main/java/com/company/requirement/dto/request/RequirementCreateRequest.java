package com.company.requirement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RequirementCreateRequest {
    @NotBlank(message = "需求名称不能为空")
    private String name;

    @NotBlank(message = "需求类型不能为空")
    private String type;

    @NotBlank(message = "客户不能为空")
    private String customer;

    private String project;

    @NotNull(message = "期望日期不能为空")
    private String expectedDate;

    private String status;
    private String priority;
    private String description;
    private Long parentId;
    private Long iterationId;
    private String frontend;
    private String backend;
    private String tester;
}
