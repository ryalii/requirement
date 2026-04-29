package com.company.requirement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.company.requirement.common.BusinessException;
import com.company.requirement.dto.request.AddMemberRequest;
import com.company.requirement.dto.request.ProjectCreateRequest;
import com.company.requirement.dto.request.ProjectUpdateRequest;
import com.company.requirement.dto.response.*;
import com.company.requirement.entity.*;
import com.company.requirement.mapper.*;
import com.company.requirement.service.ProjectService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectMapper projectMapper;
    private final ProjectMemberMapper projectMemberMapper;
    private final VersionMapper versionMapper;
    private final IterationMapper iterationMapper;
    private final RequirementMapper requirementMapper;
    private final OperationLogMapper operationLogMapper;

    public ProjectServiceImpl(ProjectMapper projectMapper, ProjectMemberMapper projectMemberMapper,
                              VersionMapper versionMapper, IterationMapper iterationMapper,
                              RequirementMapper requirementMapper, OperationLogMapper operationLogMapper) {
        this.projectMapper = projectMapper;
        this.projectMemberMapper = projectMemberMapper;
        this.versionMapper = versionMapper;
        this.iterationMapper = iterationMapper;
        this.requirementMapper = requirementMapper;
        this.operationLogMapper = operationLogMapper;
    }

    @Override
    public IPage<ProjectVO> listProjects(String keyword, String status, int page, int pageSize) {
        Page<Project> pg = new Page<>(page, pageSize);
        LambdaQueryWrapper<Project> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) wrapper.eq(Project::getStatus, status);
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Project::getName, keyword)
                    .or().like(Project::getCode, keyword));
        }
        wrapper.orderByDesc(Project::getCreatedAt);

        IPage<Project> result = projectMapper.selectPage(pg, wrapper);
        return result.convert(this::toProjectVO);
    }

    @Override
    public ProjectDetailVO getProjectDetail(Long id) {
        Project project = projectMapper.selectById(id);
        if (project == null || project.getDeleted() == 1) {
            throw BusinessException.notFound("项目不存在");
        }

        ProjectDetailVO detail = new ProjectDetailVO();
        detail.setProject(toProjectVO(project));

        ProjectDetailVO.ProjectStats stats = new ProjectDetailVO.ProjectStats();
        stats.setTotalRequirements(requirementMapper.selectCount(
                new LambdaQueryWrapper<Requirement>().eq(Requirement::getProject, project.getName())));
        stats.setCompletedRequirements(requirementMapper.selectCount(
                new LambdaQueryWrapper<Requirement>().eq(Requirement::getProject, project.getName()).eq(Requirement::getStatus, "已完成")));
        stats.setInProgressRequirements(requirementMapper.selectCount(
                new LambdaQueryWrapper<Requirement>().eq(Requirement::getProject, project.getName()).eq(Requirement::getStatus, "进行中")));
        detail.setStats(stats);

        detail.setMembers(getMembers(id));
        detail.setLogs(getLogs(id));
        return detail;
    }

    @Override
    @Transactional
    public ProjectVO createProject(ProjectCreateRequest request) {
        Project project = new Project();
        project.setName(request.getName());
        project.setCode(request.getCode());
        project.setFinanceCode(request.getFinanceCode());
        project.setOwner(request.getOwner());
        project.setManager(request.getManager());
        if (request.getStartDate() != null) project.setStartDate(LocalDate.parse(request.getStartDate()));
        if (request.getEndDate() != null) project.setEndDate(LocalDate.parse(request.getEndDate()));
        project.setStatus(request.getStatus() != null ? request.getStatus() : "未开始");
        project.setDescription(request.getDescription());
        projectMapper.insert(project);

        // Operation log
        OperationLog log = new OperationLog();
        log.setTargetType("project");
        log.setTargetId(project.getId());
        log.setAction("创建");
        log.setOperator(request.getOwner() != null ? request.getOwner() : "system");
        log.setDescription("创建项目: " + project.getName());
        operationLogMapper.insert(log);

        return toProjectVO(project);
    }

    @Override
    @Transactional
    public ProjectVO updateProject(Long id, ProjectUpdateRequest request) {
        Project project = projectMapper.selectById(id);
        if (project == null || project.getDeleted() == 1) {
            throw BusinessException.notFound("项目不存在");
        }

        if (request.getName() != null) project.setName(request.getName());
        if (request.getFinanceCode() != null) project.setFinanceCode(request.getFinanceCode());
        if (request.getOwner() != null) project.setOwner(request.getOwner());
        if (request.getManager() != null) project.setManager(request.getManager());
        if (request.getStartDate() != null) project.setStartDate(LocalDate.parse(request.getStartDate()));
        if (request.getEndDate() != null) project.setEndDate(LocalDate.parse(request.getEndDate()));
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        if (request.getDescription() != null) project.setDescription(request.getDescription());

        projectMapper.updateById(project);

        OperationLog log = new OperationLog();
        log.setTargetType("project");
        log.setTargetId(project.getId());
        log.setAction("编辑");
        log.setOperator("system");
        log.setDescription("编辑项目: " + project.getName());
        operationLogMapper.insert(log);

        return toProjectVO(project);
    }

    @Override
    @Transactional
    public void deleteProject(Long id) {
        Project project = projectMapper.selectById(id);
        if (project == null || project.getDeleted() == 1) {
            throw BusinessException.notFound("项目不存在");
        }
        projectMapper.deleteById(id);
    }

    @Override
    public ProjectTreeVO getProjectTree(Long id) {
        Project project = projectMapper.selectById(id);
        if (project == null || project.getDeleted() == 1) {
            throw BusinessException.notFound("项目不存在");
        }

        ProjectTreeVO tree = new ProjectTreeVO();
        tree.setProject(toProjectVO(project));

        List<Version> versions = versionMapper.selectList(
                new LambdaQueryWrapper<Version>().eq(Version::getProjectId, id));
        tree.setVersions(versions.stream().map(v -> {
            ProjectTreeVO.VersionNode vn = new ProjectTreeVO.VersionNode();
            vn.setVersion(toVersionVO(v));
            List<Iteration> iterations = iterationMapper.selectList(
                    new LambdaQueryWrapper<Iteration>().eq(Iteration::getVersionId, v.getId()));
            vn.setIterations(iterations.stream().map(i -> {
                ProjectTreeVO.IterationNode in = new ProjectTreeVO.IterationNode();
                in.setIteration(toIterationVO(i));
                in.setArs(requirementMapper.selectList(
                        new LambdaQueryWrapper<Requirement>().eq(Requirement::getIterationId, i.getId()))
                        .stream().map(this::toReqSimpleVO).collect(Collectors.toList()));
                return in;
            }).collect(Collectors.toList()));
            return vn;
        }).collect(Collectors.toList()));

        return tree;
    }

    @Override
    public List<ProjectMemberVO> getMembers(Long id) {
        return projectMemberMapper.selectList(
                new LambdaQueryWrapper<ProjectMember>().eq(ProjectMember::getProjectId, id))
                .stream().map(m -> {
                    ProjectMemberVO vo = new ProjectMemberVO();
                    vo.setId(m.getId());
                    vo.setProjectId(m.getProjectId());
                    vo.setName(m.getName());
                    vo.setRole(m.getRole());
                    vo.setEmail(m.getEmail());
                    vo.setPhone(m.getPhone());
                    return vo;
                }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProjectMemberVO addMember(Long id, AddMemberRequest request) {
        Project project = projectMapper.selectById(id);
        if (project == null || project.getDeleted() == 1) {
            throw BusinessException.notFound("项目不存在");
        }

        ProjectMember member = new ProjectMember();
        member.setProjectId(id);
        member.setName(request.getName());
        member.setRole(request.getRole());
        member.setEmail(request.getEmail());
        member.setPhone(request.getPhone());
        projectMemberMapper.insert(member);

        OperationLog log = new OperationLog();
        log.setTargetType("project");
        log.setTargetId(id);
        log.setAction("编辑");
        log.setOperator("system");
        log.setDescription("添加成员: " + request.getName());
        operationLogMapper.insert(log);

        ProjectMemberVO vo = new ProjectMemberVO();
        vo.setId(member.getId());
        vo.setProjectId(member.getProjectId());
        vo.setName(member.getName());
        vo.setRole(member.getRole());
        vo.setEmail(member.getEmail());
        vo.setPhone(member.getPhone());
        return vo;
    }

    @Override
    @Transactional
    public void removeMember(Long projectId, Long memberId) {
        ProjectMember member = projectMemberMapper.selectById(memberId);
        if (member != null) {
            projectMemberMapper.deleteById(memberId);
            OperationLog log = new OperationLog();
            log.setTargetType("project");
            log.setTargetId(projectId);
            log.setAction("编辑");
            log.setOperator("system");
            log.setDescription("移除成员: " + member.getName());
            operationLogMapper.insert(log);
        }
    }

    @Override
    public List<OperationLogVO> getLogs(Long id) {
        return operationLogMapper.selectList(
                new LambdaQueryWrapper<OperationLog>()
                        .eq(OperationLog::getTargetType, "project")
                        .eq(OperationLog::getTargetId, id)
                        .orderByDesc(OperationLog::getTimestamp))
                .stream().map(this::toLogVO).collect(Collectors.toList());
    }

    @Override
    public List<Project> exportAll(String keyword, String status) {
        LambdaQueryWrapper<Project> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) wrapper.eq(Project::getStatus, status);
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Project::getName, keyword).or().like(Project::getCode, keyword));
        }
        return projectMapper.selectList(wrapper);
    }

    private ProjectVO toProjectVO(Project p) {
        ProjectVO vo = new ProjectVO();
        vo.setId(p.getId());
        vo.setName(p.getName());
        vo.setCode(p.getCode());
        vo.setFinanceCode(p.getFinanceCode());
        vo.setOwner(p.getOwner());
        vo.setManager(p.getManager());
        vo.setStartDate(p.getStartDate());
        vo.setEndDate(p.getEndDate());
        vo.setStatus(p.getStatus());
        vo.setDescription(p.getDescription());
        vo.setCreatedAt(p.getCreatedAt());

        // Counts
        vo.setVersionCount(versionMapper.selectCount(
                new LambdaQueryWrapper<Version>().eq(Version::getProjectId, p.getId())).intValue());
        vo.setIterationCount(iterationMapper.selectCount(
                new LambdaQueryWrapper<Iteration>().eq(Iteration::getProjectId, p.getId())).intValue());
        vo.setMemberCount(projectMemberMapper.selectCount(
                new LambdaQueryWrapper<ProjectMember>().eq(ProjectMember::getProjectId, p.getId())).intValue());
        vo.setRequirementCount(requirementMapper.selectCount(
                new LambdaQueryWrapper<Requirement>().eq(Requirement::getProject, p.getName())).intValue());
        return vo;
    }

    private VersionVO toVersionVO(Version v) {
        VersionVO vo = new VersionVO();
        vo.setId(v.getId());
        vo.setProductName(v.getProductName());
        vo.setProjectId(v.getProjectId());
        vo.setVersionNumber(v.getVersionNumber());
        vo.setStartDate(v.getStartDate());
        vo.setEndDate(v.getEndDate());
        vo.setStatus(v.getStatus());
        vo.setDescription(v.getDescription());
        vo.setCreatedAt(v.getCreatedAt());
        return vo;
    }

    private IterationVO toIterationVO(Iteration i) {
        IterationVO vo = new IterationVO();
        vo.setId(i.getId());
        vo.setName(i.getName());
        vo.setProjectId(i.getProjectId());
        vo.setProductName(i.getProductName());
        vo.setVersionId(i.getVersionId());
        vo.setStartDate(i.getStartDate());
        vo.setEndDate(i.getEndDate());
        vo.setStatus(i.getStatus());
        vo.setDescription(i.getDescription());
        vo.setCreatedAt(i.getCreatedAt());
        return vo;
    }

    private RequirementVO toReqSimpleVO(Requirement r) {
        RequirementVO vo = new RequirementVO();
        vo.setId(r.getId());
        vo.setCode(r.getCode());
        vo.setName(r.getName());
        vo.setType(r.getType());
        vo.setStatus(r.getStatus());
        vo.setPriority(r.getPriority());
        return vo;
    }

    private OperationLogVO toLogVO(OperationLog l) {
        OperationLogVO vo = new OperationLogVO();
        vo.setId(l.getId());
        vo.setTargetType(l.getTargetType());
        vo.setTargetId(l.getTargetId());
        vo.setAction(l.getAction());
        vo.setOperator(l.getOperator());
        vo.setTimestamp(l.getTimestamp());
        vo.setOldValue(l.getOldValue());
        vo.setNewValue(l.getNewValue());
        vo.setDescription(l.getDescription());
        return vo;
    }
}
