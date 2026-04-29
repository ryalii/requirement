package com.company.requirement.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class ProjectDetailVO {
    private ProjectVO project;
    private ProjectStats stats;
    private List<ProjectMemberVO> members;
    private List<OperationLogVO> logs;

    @Data
    public static class ProjectStats {
        private long totalRequirements;
        private long completedRequirements;
        private long inProgressRequirements;
    }
}
