package com.company.requirement.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("t_task_history")
public class TaskHistory {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long taskId;
    private String action;
    private String operator;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime timestamp;
    private String oldValue;
    private String newValue;
    private String description;
}
