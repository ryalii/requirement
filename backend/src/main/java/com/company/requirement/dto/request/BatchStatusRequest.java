package com.company.requirement.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class BatchStatusRequest {
    @NotEmpty(message = "ID列表不能为空")
    private List<Long> ids;
    private String status;
}
