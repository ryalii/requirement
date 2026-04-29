package com.company.requirement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProjectCreateRequest {
    @NotBlank(message = "项目名称不能为空")
    private String name;

    @NotBlank(message = "项目编号不能为空")
    private String code;

    private String financeCode;
    private String owner;
    private String manager;
    private String startDate;
    private String endDate;
    private String status;
    private String description;
}
