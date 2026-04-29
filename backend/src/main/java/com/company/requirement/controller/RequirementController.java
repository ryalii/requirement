package com.company.requirement.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.company.requirement.common.PageResult;
import com.company.requirement.common.Result;
import com.company.requirement.dto.request.ConvertToIrRequest;
import com.company.requirement.dto.request.DecomposeRequest;
import com.company.requirement.dto.request.RequirementCreateRequest;
import com.company.requirement.dto.request.RequirementUpdateRequest;
import com.company.requirement.dto.response.RequirementAncestorVO;
import com.company.requirement.dto.response.RequirementTreeVO;
import com.company.requirement.dto.response.RequirementVO;
import com.company.requirement.entity.Requirement;
import com.company.requirement.service.RequirementService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/v1/requirements")
public class RequirementController {

    private final RequirementService requirementService;

    public RequirementController(RequirementService requirementService) {
        this.requirementService = requirementService;
    }

    @GetMapping
    public PageResult<RequirementVO> list(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        IPage<RequirementVO> result = requirementService.listRequirements(type, status, keyword, page, pageSize);
        return PageResult.of((int) result.getCurrent(), (int) result.getSize(), result.getTotal(), result.getRecords());
    }

    @GetMapping("/{id}")
    public Result<RequirementVO> get(@PathVariable Long id) {
        return Result.success(requirementService.getRequirement(id));
    }

    @PostMapping
    public Result<RequirementVO> create(@Valid @RequestBody RequirementCreateRequest request) {
        return Result.success(requirementService.createRequirement(request));
    }

    @PutMapping("/{id}")
    public Result<RequirementVO> update(@PathVariable Long id, @Valid @RequestBody RequirementUpdateRequest request) {
        return Result.success(requirementService.updateRequirement(id, request));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        requirementService.deleteRequirement(id);
        return Result.success(null);
    }

    @PostMapping("/{id}/convert-to-ir")
    public Result<RequirementVO> convertToIr(@PathVariable Long id, @RequestBody ConvertToIrRequest request) {
        return Result.success(requirementService.convertToIr(id, request));
    }

    @PostMapping("/{id}/decompose")
    public Result<List<RequirementVO>> decompose(@PathVariable Long id, @Valid @RequestBody DecomposeRequest request) {
        return Result.success(requirementService.decompose(id, request));
    }

    @GetMapping("/{id}/tree")
    public Result<RequirementTreeVO> tree(@PathVariable Long id) {
        return Result.success(requirementService.getRequirementTree(id));
    }

    @GetMapping("/{id}/children")
    public Result<List<RequirementVO>> children(@PathVariable Long id) {
        return Result.success(requirementService.getChildren(id));
    }

    @GetMapping("/{id}/ancestors")
    public Result<List<RequirementAncestorVO>> ancestors(@PathVariable Long id) {
        return Result.success(requirementService.getAncestors(id));
    }

    @GetMapping("/export")
    public byte[] export(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        List<Requirement> list = requirementService.exportAll(type, status, keyword);

        StringBuilder csv = new StringBuilder();
        csv.append('﻿'); // BOM for Excel Chinese support
        csv.append("编号,名称,类型,客户,项目,期望日期,状态,优先级\n");
        for (Requirement r : list) {
            csv.append(String.format("%s,%s,%s,%s,%s,%s,%s,%s\n",
                    safe(r.getCode()), safe(r.getName()), safe(r.getType()),
                    safe(r.getCustomer()), safe(r.getProject()),
                    r.getExpectedDate() != null ? r.getExpectedDate().toString() : "",
                    safe(r.getStatus()), safe(r.getPriority())));
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String safe(String s) {
        return s != null ? s : "";
    }
}
