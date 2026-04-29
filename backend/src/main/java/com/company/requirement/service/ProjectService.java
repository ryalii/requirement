package com.company.requirement.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.company.requirement.dto.request.AddMemberRequest;
import com.company.requirement.dto.request.ProjectCreateRequest;
import com.company.requirement.dto.request.ProjectUpdateRequest;
import com.company.requirement.dto.response.*;
import com.company.requirement.entity.Project;
import com.company.requirement.entity.ProjectMember;

import java.util.List;

public interface ProjectService {
    IPage<ProjectVO> listProjects(String keyword, String status, int page, int pageSize);
    ProjectDetailVO getProjectDetail(Long id);
    ProjectVO createProject(ProjectCreateRequest request);
    ProjectVO updateProject(Long id, ProjectUpdateRequest request);
    void deleteProject(Long id);
    ProjectTreeVO getProjectTree(Long id);
    List<ProjectMemberVO> getMembers(Long id);
    ProjectMemberVO addMember(Long id, AddMemberRequest request);
    void removeMember(Long projectId, Long memberId);
    List<OperationLogVO> getLogs(Long id);
    List<Project> exportAll(String keyword, String status);
}
