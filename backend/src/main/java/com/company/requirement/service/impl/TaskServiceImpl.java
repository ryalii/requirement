package com.company.requirement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.company.requirement.common.BusinessException;
import com.company.requirement.common.CodeGenerator;
import com.company.requirement.dto.request.*;
import com.company.requirement.dto.response.TaskHistoryVO;
import com.company.requirement.dto.response.TaskStatsVO;
import com.company.requirement.dto.response.TaskVO;
import com.company.requirement.entity.Task;
import com.company.requirement.entity.TaskHistory;
import com.company.requirement.mapper.TaskHistoryMapper;
import com.company.requirement.mapper.TaskMapper;
import com.company.requirement.service.TaskService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskMapper taskMapper;
    private final TaskHistoryMapper taskHistoryMapper;
    private final CodeGenerator codeGenerator;

    public TaskServiceImpl(TaskMapper taskMapper, TaskHistoryMapper taskHistoryMapper, CodeGenerator codeGenerator) {
        this.taskMapper = taskMapper;
        this.taskHistoryMapper = taskHistoryMapper;
        this.codeGenerator = codeGenerator;
    }

    @Override
    public IPage<TaskVO> listTasks(String type, String status, String keyword, String assignee,
                                   String sortBy, String sortOrder, int page, int pageSize) {
        Page<Task> pg = new Page<>(page, pageSize);
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<>();

        if (type != null && !type.isEmpty()) wrapper.eq(Task::getType, type);
        if (status != null && !status.isEmpty()) wrapper.eq(Task::getStatus, status);
        if (assignee != null && !assignee.isEmpty()) wrapper.eq(Task::getAssignee, assignee);
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Task::getName, keyword)
                    .or().like(Task::getCode, keyword)
                    .or().like(Task::getDescription, keyword));
        }

        if ("deadline".equals(sortBy)) {
            wrapper.orderBy(true, !"desc".equals(sortOrder), Task::getDeadline);
        } else {
            wrapper.orderByDesc(Task::getCreatedAt);
        }

        IPage<Task> result = taskMapper.selectPage(pg, wrapper);
        return result.convert(this::toVO);
    }

    @Override
    public TaskStatsVO getTaskStats() {
        TaskStatsVO stats = new TaskStatsVO();
        stats.setTotal(taskMapper.selectCount(null));
        stats.setPending(taskMapper.selectCount(new LambdaQueryWrapper<Task>().eq(Task::getStatus, "待分配")));
        stats.setInProgress(taskMapper.selectCount(new LambdaQueryWrapper<Task>().eq(Task::getStatus, "进行中")));
        stats.setCompleted(taskMapper.selectCount(new LambdaQueryWrapper<Task>().eq(Task::getStatus, "已完成")));
        stats.setOverdue(taskMapper.selectCount(
                new LambdaQueryWrapper<Task>()
                        .lt(Task::getDeadline, LocalDate.now())
                        .notIn(Task::getStatus, "已完成", "已关闭")));
        return stats;
    }

    @Override
    public TaskVO getTask(Long id) {
        Task task = taskMapper.selectById(id);
        if (task == null || task.getDeleted() == 1) {
            throw BusinessException.notFound("任务不存在");
        }
        TaskVO vo = toVO(task);
        List<TaskHistory> histories = taskHistoryMapper.selectList(
                new LambdaQueryWrapper<TaskHistory>().eq(TaskHistory::getTaskId, id)
                        .orderByDesc(TaskHistory::getTimestamp));
        vo.setHistories(histories.stream().map(this::toHistoryVO).collect(Collectors.toList()));
        return vo;
    }

    @Override
    @Transactional
    public TaskVO createTask(TaskCreateRequest request) {
        Task task = new Task();
        task.setName(request.getName());
        task.setType(request.getType());
        task.setAssignee(request.getAssignee());
        task.setCreator(request.getCreator());
        task.setDeadline(LocalDate.parse(request.getDeadline()));
        task.setStatus(request.getAssignee() != null ? "进行中" : "待分配");
        task.setDescription(request.getDescription());
        task.setRelatedRequirementId(request.getRelatedRequirementId());

        String code = codeGenerator.generateTaskCode(
                p -> { Task t = taskMapper.selectOne(
                        new LambdaQueryWrapper<Task>().likeRight(Task::getCode, p).orderByDesc(Task::getCode).last("LIMIT 1"));
                    return t != null ? t.getCode() : null; });
        task.setCode(code);

        taskMapper.insert(task);

        // Create history
        TaskHistory history = new TaskHistory();
        history.setTaskId(task.getId());
        history.setAction("创建");
        history.setOperator(request.getCreator());
        history.setDescription("创建任务: " + task.getName());
        taskHistoryMapper.insert(history);

        return toVO(task);
    }

    @Override
    @Transactional
    public TaskVO updateTask(Long id, TaskUpdateRequest request) {
        Task task = taskMapper.selectById(id);
        if (task == null || task.getDeleted() == 1) {
            throw BusinessException.notFound("任务不存在");
        }

        if (request.getName() != null) task.setName(request.getName());
        if (request.getType() != null) task.setType(request.getType());
        if (request.getAssignee() != null) task.setAssignee(request.getAssignee());
        if (request.getDeadline() != null) task.setDeadline(LocalDate.parse(request.getDeadline()));
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getRelatedRequirementId() != null) task.setRelatedRequirementId(request.getRelatedRequirementId());

        taskMapper.updateById(task);
        return toVO(task);
    }

    @Override
    @Transactional
    public void deleteTask(Long id) {
        Task task = taskMapper.selectById(id);
        if (task == null || task.getDeleted() == 1) {
            throw BusinessException.notFound("任务不存在");
        }
        taskMapper.deleteById(id);
    }

    @Override
    @Transactional
    public TaskVO assignTask(Long id, TaskAssignRequest request) {
        Task task = taskMapper.selectById(id);
        if (task == null || task.getDeleted() == 1) {
            throw BusinessException.notFound("任务不存在");
        }
        if ("已完成".equals(task.getStatus()) || "已关闭".equals(task.getStatus())) {
            throw BusinessException.badRequest("已完成或已关闭的任务不可分配");
        }

        String oldAssignee = task.getAssignee();
        task.setAssignee(request.getAssignee());
        if ("待分配".equals(task.getStatus())) {
            task.setStatus("进行中");
        }
        taskMapper.updateById(task);

        TaskHistory history = new TaskHistory();
        history.setTaskId(task.getId());
        history.setAction("分配");
        history.setOperator(request.getAssignee());
        history.setOldValue(oldAssignee);
        history.setNewValue(request.getAssignee());
        history.setDescription("分配任务给: " + request.getAssignee());
        taskHistoryMapper.insert(history);

        return toVO(task);
    }

    @Override
    @Transactional
    public TaskVO changeTaskStatus(Long id, TaskStatusRequest request) {
        Task task = taskMapper.selectById(id);
        if (task == null || task.getDeleted() == 1) {
            throw BusinessException.notFound("任务不存在");
        }

        String newStatus = request.getStatus();
        String oldStatus = task.getStatus();

        if ("已完成".equals(oldStatus) || "已关闭".equals(oldStatus)) {
            throw BusinessException.badRequest("已完成或已关闭的任务不可变更状态");
        }

        // State machine validation
        if ("进行中".equals(newStatus) && task.getAssignee() == null) {
            throw BusinessException.badRequest("进行中状态需要指定分配人");
        }

        task.setStatus(newStatus);
        taskMapper.updateById(task);

        TaskHistory history = new TaskHistory();
        history.setTaskId(task.getId());
        history.setAction("状态变更");
        history.setOperator(task.getAssignee() != null ? task.getAssignee() : task.getCreator());
        history.setOldValue(oldStatus);
        history.setNewValue(newStatus);
        history.setDescription("状态变更: " + oldStatus + " → " + newStatus);
        taskHistoryMapper.insert(history);

        return toVO(task);
    }

    @Override
    public List<TaskHistoryVO> getTaskHistories(Long id) {
        List<TaskHistory> histories = taskHistoryMapper.selectList(
                new LambdaQueryWrapper<TaskHistory>().eq(TaskHistory::getTaskId, id)
                        .orderByDesc(TaskHistory::getTimestamp));
        return histories.stream().map(this::toHistoryVO).collect(Collectors.toList());
    }

    @Override
    public List<Task> exportAll(String type, String status, String keyword, String assignee) {
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<>();
        if (type != null && !type.isEmpty()) wrapper.eq(Task::getType, type);
        if (status != null && !status.isEmpty()) wrapper.eq(Task::getStatus, status);
        if (assignee != null && !assignee.isEmpty()) wrapper.eq(Task::getAssignee, assignee);
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Task::getName, keyword)
                    .or().like(Task::getCode, keyword)
                    .or().like(Task::getDescription, keyword));
        }
        return taskMapper.selectList(wrapper);
    }

    private TaskVO toVO(Task task) {
        TaskVO vo = new TaskVO();
        vo.setId(task.getId());
        vo.setCode(task.getCode());
        vo.setName(task.getName());
        vo.setType(task.getType());
        vo.setAssignee(task.getAssignee());
        vo.setCreator(task.getCreator());
        vo.setDeadline(task.getDeadline());
        vo.setStatus(task.getStatus());
        vo.setDescription(task.getDescription());
        vo.setRelatedRequirementId(task.getRelatedRequirementId());
        vo.setCreatedAt(task.getCreatedAt());
        vo.setUpdatedAt(task.getUpdatedAt());

        if (task.getDeadline() != null) {
            long days = ChronoUnit.DAYS.between(LocalDate.now(), task.getDeadline());
            vo.setDaysRemaining(days);
            vo.setOverdue(days < 0 && !"已完成".equals(task.getStatus()) && !"已关闭".equals(task.getStatus()));
        }
        return vo;
    }

    private TaskHistoryVO toHistoryVO(TaskHistory h) {
        TaskHistoryVO vo = new TaskHistoryVO();
        vo.setId(h.getId());
        vo.setTaskId(h.getTaskId());
        vo.setAction(h.getAction());
        vo.setOperator(h.getOperator());
        vo.setTimestamp(h.getTimestamp());
        vo.setOldValue(h.getOldValue());
        vo.setNewValue(h.getNewValue());
        vo.setDescription(h.getDescription());
        return vo;
    }
}
