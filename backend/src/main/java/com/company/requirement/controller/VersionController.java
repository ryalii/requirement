package com.company.requirement.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.company.requirement.common.PageResult;
import com.company.requirement.common.Result;
import com.company.requirement.dto.response.IterationVO;
import com.company.requirement.dto.response.OperationLogVO;
import com.company.requirement.dto.response.VersionVO;
import com.company.requirement.entity.Version;
import com.company.requirement.service.VersionService;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/versions")
public class VersionController {

    private final VersionService versionService;

    public VersionController(VersionService versionService) {
        this.versionService = versionService;
    }

    @GetMapping
    public PageResult<VersionVO> list(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        IPage<VersionVO> result = versionService.listVersions(projectId, status, keyword, page, pageSize);
        return PageResult.of((int) result.getCurrent(), (int) result.getSize(), result.getTotal(), result.getRecords());
    }

    @GetMapping("/{id}")
    public Result<VersionVO> get(@PathVariable Long id) {
        return Result.success(versionService.getVersion(id));
    }

    @PostMapping
    public Result<VersionVO> create(@RequestBody Version version) {
        return Result.success(versionService.createVersion(version));
    }

    @PutMapping("/{id}")
    public Result<VersionVO> update(@PathVariable Long id, @RequestBody Version version) {
        return Result.success(versionService.updateVersion(id, version));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        versionService.deleteVersion(id);
        return Result.success(null);
    }

    @GetMapping("/{id}/iterations")
    public Result<List<IterationVO>> iterations(@PathVariable Long id) {
        return Result.success(versionService.getIterations(id));
    }

    @GetMapping("/{id}/stats")
    public Result<Map<String, Object>> stats(@PathVariable Long id) {
        return Result.success(versionService.getStats(id));
    }

    @GetMapping("/{id}/logs")
    public Result<List<OperationLogVO>> logs(@PathVariable Long id) {
        return Result.success(versionService.getLogs(id));
    }

    @GetMapping("/export")
    public byte[] export(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        List<Version> list = versionService.exportAll(projectId, status, keyword);
        StringBuilder csv = new StringBuilder();
        csv.append('﻿');
        csv.append("版本号,产品名称,项目ID,状态\n");
        for (Version v : list) {
            csv.append(String.format("%s,%s,%s,%s\n",
                    safe(v.getVersionNumber()), safe(v.getProductName()),
                    v.getProjectId() != null ? v.getProjectId().toString() : "",
                    safe(v.getStatus())));
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String safe(String s) { return s != null ? s : ""; }
}
