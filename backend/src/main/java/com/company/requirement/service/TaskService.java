package com.company.requirement.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.company.requirement.dto.request.*;
import com.company.requirement.dto.response.TaskHistoryVO;
import com.company.requirement.dto.response.TaskStatsVO;
import com.company.requirement.dto.response.TaskVO;
import com.company.requirement.entity.Task;

import java.util.List;

public interface TaskService {
    IPage<TaskVO> listTasks(String type, String status, String keyword, String assignee, String sortBy, String sortOrder, int page, int pageSize);
    TaskStatsVO getTaskStats();
    TaskVO getTask(Long id);
    TaskVO createTask(TaskCreateRequest request);
    TaskVO updateTask(Long id, TaskUpdateRequest request);
    void deleteTask(Long id);
    TaskVO assignTask(Long id, TaskAssignRequest request);
    TaskVO changeTaskStatus(Long id, TaskStatusRequest request);
    List<TaskHistoryVO> getTaskHistories(Long id);
    List<Task> exportAll(String type, String status, String keyword, String assignee);
}
