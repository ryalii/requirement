package com.company.requirement.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("t_operation_log")
public class OperationLog {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String targetType;
    private Long targetId;
    private String action;
    private String operator;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime timestamp;
    private String oldValue;
    private String newValue;
    private String description;
}
