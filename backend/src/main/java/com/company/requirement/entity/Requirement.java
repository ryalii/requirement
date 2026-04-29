package com.company.requirement.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("t_requirement")
public class Requirement {
    @TableId(type = IdType.AUTO)
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
    private Long irId;
    private Long iterationId;
    private String frontend;
    private String backend;
    private String tester;
    private Integer testCaseCount;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    @TableLogic
    private Integer deleted;
}
