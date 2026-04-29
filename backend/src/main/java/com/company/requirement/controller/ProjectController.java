package com.company.requirement.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.company.requirement.common.PageResult;
import com.company.requirement.common.Result;
import com.company.requirement.dto.request.AddMemberRequest;
import com.company.requirement.dto.request.ProjectCreateRequest;
import com.company.requirement.dto.request.ProjectUpdateRequest;
import com.company.requirement.dto.response.*;
import com.company.requirement.entity.Project;
import com.company.requirement.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public PageResult<ProjectVO> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        IPage<ProjectVO> result = projectService.listProjects(keyword, status, page, pageSize);
        return PageResult.of((int) result.getCurrent(), (int) result.getSize(), result.getTotal(), result.getRecords());
    }

    @GetMapping("/{id}")
    public Result<ProjectDetailVO> get(@PathVariable Long id) {
        return Result.success(projectService.getProjectDetail(id));
    }

    @PostMapping
    public Result<ProjectVO> create(@Valid @RequestBody ProjectCreateRequest request) {
        return Result.success(projectService.createProject(request));
    }

    @PutMapping("/{id}")
    public Result<ProjectVO> update(@PathVariable Long id, @Valid @RequestBody ProjectUpdateRequest request) {
        return Result.success(projectService.updateProject(id, request));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        projectService.deleteProject(id);
        return Result.success(null);
    }

    @GetMapping("/{id}/tree")
    public Result<ProjectTreeVO> tree(@PathVariable Long id) {
        return Result.success(projectService.getProjectTree(id));
    }

    @GetMapping("/{id}/members")
    public Result<List<ProjectMemberVO>> members(@PathVariable Long id) {
        return Result.success(projectService.getMembers(id));
    }

    @PostMapping("/{id}/members")
    public Result<ProjectMemberVO> addMember(@PathVariable Long id, @Valid @RequestBody AddMemberRequest request) {
        return Result.success(projectService.addMember(id, request));
    }

    @DeleteMapping("/{id}/members/{memberId}")
    public Result<Void> removeMember(@PathVariable Long id, @PathVariable Long memberId) {
        projectService.removeMember(id, memberId);
        return Result.success(null);
    }

    @GetMapping("/{id}/logs")
    public Result<List<OperationLogVO>> logs(@PathVariable Long id) {
        return Result.success(projectService.getLogs(id));
    }

    @GetMapping("/export")
    public byte[] export(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {
        List<Project> list = projectService.exportAll(keyword, status);
        StringBuilder csv = new StringBuilder();
        csv.append('﻿');
        csv.append("名称,编号,财务编号,负责人,状态\n");
        for (Project p : list) {
            csv.append(String.format("%s,%s,%s,%s,%s\n",
                    safe(p.getName()), safe(p.getCode()), safe(p.getFinanceCode()),
                    safe(p.getOwner()), safe(p.getStatus())));
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String safe(String s) { return s != null ? s : ""; }
}
