package com.company.requirement.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("t_work_item")
public class WorkItem {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private LocalDate date;
    private String type; // meeting, task, review
    private String color;
    private String creator;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    @TableLogic
    private Integer deleted;
}