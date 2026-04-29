package com.company.requirement.dto.response;

import lombok.Data;

@Data
public class TaskStatsVO {
    private long total;
    private long pending;
    private long inProgress;
    private long completed;
    private long overdue;
}
