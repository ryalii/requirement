package com.company.requirement.dto.request;

import lombok.Data;

@Data
public class ProjectUpdateRequest {
    private String name;
    private String financeCode;
    private String owner;
    private String manager;
    private String startDate;
    private String endDate;
    private String status;
    private String description;
}
