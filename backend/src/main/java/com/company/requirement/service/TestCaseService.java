package com.company.requirement.service;

import com.company.requirement.dto.request.*;
import com.company.requirement.dto.response.TestCaseStatsVO;
import com.company.requirement.dto.response.TestCaseVO;

import java.util.List;

public interface TestCaseService {
    List<TestCaseVO> listTestCases(Long arId);
    TestCaseStatsVO getStats(Long arId);
    TestCaseVO createTestCase(Long arId, TestCaseCreateRequest request);
    TestCaseVO updateTestCase(Long id, TestCaseUpdateRequest request);
    void deleteTestCase(Long id);
    void batchDelete(BatchDeleteRequest request);
    TestCaseVO changeStatus(Long id, TestCaseStatusRequest request);
    void batchChangeStatus(BatchStatusRequest request);
}
