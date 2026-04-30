package com.company.requirement.dto.response;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class WorkItemVO {
    private Long id;
    private String title;
    private LocalDate date;
    private String type; // meeting, task, review
    private String color;
    private String creator;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}