package com.company.requirement.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class DecomposeRequest {
    private List<DecomposeItem> items;

    @Data
    public static class DecomposeItem {
        private String name;
        private String description;
        private String priority;
    }
}
