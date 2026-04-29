package com.company.requirement.dto.request;

import lombok.Data;

@Data
public class RequirementUpdateRequest {
    private String name;
    private String customer;
    private String project;
    private String expectedDate;
    private String status;
    private String priority;
    private String description;
    private Long iterationId;
    private String frontend;
    private String backend;
    private String tester;
    private String updatedAt;
}
