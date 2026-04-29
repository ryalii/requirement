package com.company.requirement.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.company.requirement.common.PageResult;
import com.company.requirement.common.Result;
import com.company.requirement.dto.response.IterationVO;
import com.company.requirement.dto.response.OperationLogVO;
import com.company.requirement.dto.response.RequirementVO;
import com.company.requirement.entity.Iteration;
import com.company.requirement.service.IterationService;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/iterations")
public class IterationController {

    private final IterationService iterationService;

    public IterationController(IterationService iterationService) {
        this.iterationService = iterationService;
    }

    @GetMapping
    public PageResult<IterationVO> list(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long versionId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        IPage<IterationVO> result = iterationService.listIterations(projectId, versionId, status, keyword, page, pageSize);
        return PageResult.of((int) result.getCurrent(), (int) result.getSize(), result.getTotal(), result.getRecords());
    }

    @GetMapping("/{id}")
    public Result<IterationVO> get(@PathVariable Long id) {
        return Result.success(iterationService.getIteration(id));
    }

    @PostMapping
    public Result<IterationVO> create(@RequestBody Iteration iteration) {
        return Result.success(iterationService.createIteration(iteration));
    }

    @PutMapping("/{id}")
    public Result<IterationVO> update(@PathVariable Long id, @RequestBody Iteration iteration) {
        return Result.success(iterationService.updateIteration(id, iteration));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        iterationService.deleteIteration(id);
        return Result.success(null);
    }

    @GetMapping("/{id}/ars")
    public Result<List<RequirementVO>> ars(@PathVariable Long id) {
        return Result.success(iterationService.getArs(id));
    }

    @GetMapping("/{id}/stats")
    public Result<Map<String, Object>> stats(@PathVariable Long id) {
        return Result.success(iterationService.getStats(id));
    }

    @GetMapping("/{id}/logs")
    public Result<List<OperationLogVO>> logs(@PathVariable Long id) {
        return Result.success(iterationService.getLogs(id));
    }

    @GetMapping("/export")
    public byte[] export(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long versionId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        List<Iteration> list = iterationService.exportAll(projectId, versionId, status, keyword);
        StringBuilder csv = new StringBuilder();
        csv.append('﻿');
        csv.append("名称,项目ID,版本ID,状态\n");
        for (Iteration i : list) {
            csv.append(String.format("%s,%s,%s,%s\n",
                    safe(i.getName()),
                    i.getProjectId() != null ? i.getProjectId().toString() : "",
                    i.getVersionId() != null ? i.getVersionId().toString() : "",
                    safe(i.getStatus())));
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String safe(String s) { return s != null ? s : ""; }
}
