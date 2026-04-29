package com.company.requirement.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.company.requirement.common.PageResult;
import com.company.requirement.common.Result;
import com.company.requirement.dto.request.*;
import com.company.requirement.dto.response.TaskHistoryVO;
import com.company.requirement.dto.response.TaskStatsVO;
import com.company.requirement.dto.response.TaskVO;
import com.company.requirement.entity.Task;
import com.company.requirement.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public PageResult<TaskVO> list(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String assignee,
            @RequestParam(defaultValue = "deadline") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        IPage<TaskVO> result = taskService.listTasks(type, status, keyword, assignee, sortBy, sortOrder, page, pageSize);
        return PageResult.of((int) result.getCurrent(), (int) result.getSize(), result.getTotal(), result.getRecords());
    }

    @GetMapping("/stats")
    public Result<TaskStatsVO> stats() {
        return Result.success(taskService.getTaskStats());
    }

    @GetMapping("/{id}")
    public Result<TaskVO> get(@PathVariable Long id) {
        return Result.success(taskService.getTask(id));
    }

    @PostMapping
    public Result<TaskVO> create(@Valid @RequestBody TaskCreateRequest request) {
        return Result.success(taskService.createTask(request));
    }

    @PutMapping("/{id}")
    public Result<TaskVO> update(@PathVariable Long id, @Valid @RequestBody TaskUpdateRequest request) {
        return Result.success(taskService.updateTask(id, request));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        taskService.deleteTask(id);
        return Result.success(null);
    }

    @PatchMapping("/{id}/assign")
    public Result<TaskVO> assign(@PathVariable Long id, @Valid @RequestBody TaskAssignRequest request) {
        return Result.success(taskService.assignTask(id, request));
    }

    @PatchMapping("/{id}/status")
    public Result<TaskVO> changeStatus(@PathVariable Long id, @Valid @RequestBody TaskStatusRequest request) {
        return Result.success(taskService.changeTaskStatus(id, request));
    }

    @GetMapping("/{id}/histories")
    public Result<List<TaskHistoryVO>> histories(@PathVariable Long id) {
        return Result.success(taskService.getTaskHistories(id));
    }

    @GetMapping("/export")
    public byte[] export(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String assignee) {
        List<Task> list = taskService.exportAll(type, status, keyword, assignee);
        StringBuilder csv = new StringBuilder();
        csv.append('﻿');
        csv.append("编号,名称,类型,分配人,创建人,截止日期,状态\n");
        for (Task t : list) {
            csv.append(String.format("%s,%s,%s,%s,%s,%s,%s\n",
                    safe(t.getCode()), safe(t.getName()), safe(t.getType()),
                    safe(t.getAssignee()), safe(t.getCreator()),
                    t.getDeadline() != null ? t.getDeadline().toString() : "",
                    safe(t.getStatus())));
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String safe(String s) { return s != null ? s : ""; }
}
