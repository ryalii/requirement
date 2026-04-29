package com.company.requirement.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("t_iteration")
public class Iteration {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private Long projectId;
    private String productName;
    private Long versionId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String description;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    @TableLogic
    private Integer deleted;
}
