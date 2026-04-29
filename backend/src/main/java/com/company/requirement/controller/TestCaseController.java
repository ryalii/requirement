package com.company.requirement.controller;

import com.company.requirement.common.Result;
import com.company.requirement.dto.request.*;
import com.company.requirement.dto.response.TestCaseStatsVO;
import com.company.requirement.dto.response.TestCaseVO;
import com.company.requirement.service.TestCaseService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class TestCaseController {

    private final TestCaseService testCaseService;

    public TestCaseController(TestCaseService testCaseService) {
        this.testCaseService = testCaseService;
    }

    @GetMapping("/api/v1/requirements/{arId}/test-cases")
    public Result<List<TestCaseVO>> list(@PathVariable Long arId) {
        return Result.success(testCaseService.listTestCases(arId));
    }

    @GetMapping("/api/v1/requirements/{arId}/test-cases/stats")
    public Result<TestCaseStatsVO> stats(@PathVariable Long arId) {
        return Result.success(testCaseService.getStats(arId));
    }

    @PostMapping("/api/v1/requirements/{arId}/test-cases")
    public Result<TestCaseVO> create(@PathVariable Long arId, @Valid @RequestBody TestCaseCreateRequest request) {
        return Result.success(testCaseService.createTestCase(arId, request));
    }

    @PutMapping("/api/v1/test-cases/{id}")
    public Result<TestCaseVO> update(@PathVariable Long id, @Valid @RequestBody TestCaseUpdateRequest request) {
        return Result.success(testCaseService.updateTestCase(id, request));
    }

    @DeleteMapping("/api/v1/test-cases/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        testCaseService.deleteTestCase(id);
        return Result.success(null);
    }

    @PatchMapping("/api/v1/test-cases/{id}/status")
    public Result<TestCaseVO> changeStatus(@PathVariable Long id, @Valid @RequestBody TestCaseStatusRequest request) {
        return Result.success(testCaseService.changeStatus(id, request));
    }

    @DeleteMapping("/api/v1/test-cases/batch")
    public Result<Void> batchDelete(@Valid @RequestBody BatchDeleteRequest request) {
        testCaseService.batchDelete(request);
        return Result.success(null);
    }

    @PatchMapping("/api/v1/test-cases/batch-status")
    public Result<Void> batchChangeStatus(@Valid @RequestBody BatchStatusRequest request) {
        testCaseService.batchChangeStatus(request);
        return Result.success(null);
    }
}
