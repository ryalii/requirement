package com.company.requirement.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.company.requirement.common.Result;
import com.company.requirement.dto.request.WorkItemCreateRequest;
import com.company.requirement.dto.response.RequirementVO;
import com.company.requirement.dto.response.TaskVO;
import com.company.requirement.dto.response.WorkItemVO;
import com.company.requirement.entity.Requirement;
import com.company.requirement.entity.Task;
import com.company.requirement.entity.WorkItem;
import com.company.requirement.mapper.RequirementMapper;
import com.company.requirement.mapper.TaskMapper;
import com.company.requirement.mapper.WorkItemMapper;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/workspace")
public class WorkspaceController {

    private final RequirementMapper requirementMapper;
    private final TaskMapper taskMapper;
    private final WorkItemMapper workItemMapper;

    public WorkspaceController(RequirementMapper requirementMapper, TaskMapper taskMapper, WorkItemMapper workItemMapper) {
        this.requirementMapper = requirementMapper;
        this.taskMapper = taskMapper;
        this.workItemMapper = workItemMapper;
    }

    @GetMapping("/urgent-requirements")
    public Result<List<RequirementVO>> urgentRequirements(
            @RequestParam(defaultValue = "8") int limit) {
        List<Requirement> list = requirementMapper.selectList(
                new LambdaQueryWrapper<Requirement>()
                        .notIn(Requirement::getStatus, "已完成", "已关闭")
                        .orderByAsc(Requirement::getExpectedDate)
                        .last("LIMIT " + limit));

        // Priority sort: 高 > 中 > 低
        list.sort((a, b) -> {
            int pa = priorityScore(a.getPriority());
            int pb = priorityScore(b.getPriority());
            if (pa != pb) return pb - pa;
            return a.getExpectedDate().compareTo(b.getExpectedDate());
        });

        List<RequirementVO> result = list.stream().map(this::toReqVO).collect(Collectors.toList());
        return Result.success(result);
    }

    @GetMapping("/overdue-tasks")
    public Result<List<TaskVO>> overdueTasks() {
        List<Task> list = taskMapper.selectList(
                new LambdaQueryWrapper<Task>()
                        .lt(Task::getDeadline, LocalDate.now())
                        .notIn(Task::getStatus, "已完成", "已关闭")
                        .orderByAsc(Task::getDeadline));
        return Result.success(list.stream().map(this::toTaskVO).collect(Collectors.toList()));
    }

    @GetMapping("/work-items")
    public Result<List<WorkItemVO>> getWorkItems() {
        List<WorkItem> list = workItemMapper.selectList(
                new LambdaQueryWrapper<WorkItem>()
                        .orderByAsc(WorkItem::getDate));
        return Result.success(list.stream().map(this::toWorkItemVO).collect(Collectors.toList()));
    }

    @PostMapping("/work-items")
    public Result<WorkItemVO> createWorkItem(@RequestBody WorkItemCreateRequest request) {
        WorkItem workItem = new WorkItem();
        workItem.setTitle(request.getTitle());
        workItem.setDate(request.getDate());
        workItem.setType(request.getType());
        workItem.setColor(request.getColor());
        workItem.setCreator(request.getCreator());

        workItemMapper.insert(workItem);
        return Result.success(toWorkItemVO(workItem));
    }

    @DeleteMapping("/work-items/{id}")
    public Result<Void> deleteWorkItem(@PathVariable Long id) {
        workItemMapper.deleteById(id);
        return Result.success(null);
    }

    private int priorityScore(String priority) {
        if ("高".equals(priority)) return 3;
        if ("中".equals(priority)) return 2;
        if ("低".equals(priority)) return 1;
        return 0;
    }

    private RequirementVO toReqVO(Requirement r) {
        RequirementVO vo = new RequirementVO();
        vo.setId(r.getId());
        vo.setCode(r.getCode());
        vo.setName(r.getName());
        vo.setType(r.getType());
        vo.setCustomer(r.getCustomer());
        vo.setProject(r.getProject());
        vo.setExpectedDate(r.getExpectedDate());
        vo.setStatus(r.getStatus());
        vo.setPriority(r.getPriority());
        vo.setCreatedAt(r.getCreatedAt());
        return vo;
    }

    private TaskVO toTaskVO(Task t) {
        TaskVO vo = new TaskVO();
        vo.setId(t.getId());
        vo.setCode(t.getCode());
        vo.setName(t.getName());
        vo.setType(t.getType());
        vo.setAssignee(t.getAssignee());
        vo.setCreator(t.getCreator());
        vo.setDeadline(t.getDeadline());
        vo.setStatus(t.getStatus());
        vo.setCreatedAt(t.getCreatedAt());
        if (t.getDeadline() != null) {
            vo.setDaysRemaining(ChronoUnit.DAYS.between(LocalDate.now(), t.getDeadline()));
            vo.setOverdue(true);
        }
        return vo;
    }

    private WorkItemVO toWorkItemVO(WorkItem w) {
        WorkItemVO vo = new WorkItemVO();
        vo.setId(w.getId());
        vo.setTitle(w.getTitle());
        vo.setDate(w.getDate());
        vo.setType(w.getType());
        vo.setColor(w.getColor());
        vo.setCreator(w.getCreator());
        vo.setCreatedAt(w.getCreatedAt());
        vo.setUpdatedAt(w.getUpdatedAt());
        return vo;
    }
}
