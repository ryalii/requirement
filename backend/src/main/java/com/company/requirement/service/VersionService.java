package com.company.requirement.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.company.requirement.dto.response.IterationVO;
import com.company.requirement.dto.response.OperationLogVO;
import com.company.requirement.dto.response.VersionVO;
import com.company.requirement.entity.Version;

import java.util.List;
import java.util.Map;

public interface VersionService {
    IPage<VersionVO> listVersions(Long projectId, String status, String keyword, int page, int pageSize);
    VersionVO getVersion(Long id);
    VersionVO createVersion(Version version);
    VersionVO updateVersion(Long id, Version version);
    void deleteVersion(Long id);
    List<IterationVO> getIterations(Long id);
    Map<String, Object> getStats(Long id);
    List<OperationLogVO> getLogs(Long id);
    List<Version> exportAll(Long projectId, String status, String keyword);
}
