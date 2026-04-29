package com.company.requirement.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class RequirementTreeVO {
    private RequirementVO requirement;
    private List<RequirementTreeVO> children;
}
