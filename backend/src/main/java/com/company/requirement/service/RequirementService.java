package com.company.requirement.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.company.requirement.dto.request.ConvertToIrRequest;
import com.company.requirement.dto.request.DecomposeRequest;
import com.company.requirement.dto.request.RequirementCreateRequest;
import com.company.requirement.dto.request.RequirementUpdateRequest;
import com.company.requirement.dto.response.RequirementAncestorVO;
import com.company.requirement.dto.response.RequirementTreeVO;
import com.company.requirement.dto.response.RequirementVO;
import com.company.requirement.entity.Requirement;

import java.util.List;

public interface RequirementService {
    IPage<RequirementVO> listRequirements(String type, String status, String keyword, int page, int pageSize);
    RequirementVO getRequirement(Long id);
    RequirementVO createRequirement(RequirementCreateRequest request);
    RequirementVO updateRequirement(Long id, RequirementUpdateRequest request);
    void deleteRequirement(Long id);
    RequirementVO convertToIr(Long id, ConvertToIrRequest request);
    List<RequirementVO> decompose(Long id, DecomposeRequest request);
    RequirementTreeVO getRequirementTree(Long id);
    List<RequirementVO> getChildren(Long id);
    List<RequirementAncestorVO> getAncestors(Long id);
    List<Requirement> exportAll(String type, String status, String keyword);
}
