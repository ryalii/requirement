package com.company.requirement.dto.response;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class RequirementVO {
    private Long id;
    private String code;
    private String name;
    private String type;
    private String customer;
    private String project;
    private LocalDate expectedDate;
    private String status;
    private String priority;
    private String description;
    private Long parentId;
    private String parentCode;
    private String parentType;
    private Long irId;
    private Long iterationId;
    private String frontend;
    private String backend;
    private String tester;
    private Integer testCaseCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TestCaseVO> testCases;
    private Integer childrenCount;
}
