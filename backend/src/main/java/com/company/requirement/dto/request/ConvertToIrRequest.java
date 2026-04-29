package com.company.requirement.dto.request;

import lombok.Data;

@Data
public class ConvertToIrRequest {
    private String name;
    private String description;
    private String priority;
    private String expectedDate;
}
