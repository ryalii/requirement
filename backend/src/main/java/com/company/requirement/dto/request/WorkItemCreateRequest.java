package com.company.requirement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class WorkItemCreateRequest {
    @NotBlank(message = "标题不能为空")
    private String title;

    @NotNull(message = "日期不能为空")
    private LocalDate date;

    @NotBlank(message = "类型不能为空")
    private String type; // meeting, task, review

    @NotBlank(message = "颜色不能为空")
    private String color;

    @NotBlank(message = "创建人不能为空")
    private String creator;
}