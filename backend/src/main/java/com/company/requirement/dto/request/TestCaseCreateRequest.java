package com.company.requirement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TestCaseCreateRequest {
    @NotBlank(message = "测试用例名称不能为空")
    private String name;
    private String priority;
    private String status;
}
