package com.company.requirement.dto.request;

import lombok.Data;

@Data
public class TestCaseUpdateRequest {
    private String name;
    private String priority;
    private String status;
}
