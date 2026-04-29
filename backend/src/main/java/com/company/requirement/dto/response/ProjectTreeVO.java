package com.company.requirement.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class ProjectTreeVO {
    private ProjectVO project;
    private List<VersionNode> versions;

    @Data
    public static class VersionNode {
        private VersionVO version;
        private List<IterationNode> iterations;
    }

    @Data
    public static class IterationNode {
        private IterationVO iteration;
        private List<RequirementVO> ars;
    }
}
