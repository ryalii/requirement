package com.company.requirement.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.company.requirement.dto.response.IterationVO;
import com.company.requirement.dto.response.OperationLogVO;
import com.company.requirement.dto.response.RequirementVO;
import com.company.requirement.entity.Iteration;

import java.util.List;
import java.util.Map;

public interface IterationService {
    IPage<IterationVO> listIterations(Long projectId, Long versionId, String status, String keyword, int page, int pageSize);
    IterationVO getIteration(Long id);
    IterationVO createIteration(Iteration iteration);
    IterationVO updateIteration(Long id, Iteration iteration);
    void deleteIteration(Long id);
    List<RequirementVO> getArs(Long id);
    Map<String, Object> getStats(Long id);
    List<OperationLogVO> getLogs(Long id);
    List<Iteration> exportAll(Long projectId, Long versionId, String status, String keyword);
}
