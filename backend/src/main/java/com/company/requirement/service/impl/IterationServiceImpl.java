package com.company.requirement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.company.requirement.common.BusinessException;
import com.company.requirement.dto.response.IterationVO;
import com.company.requirement.dto.response.OperationLogVO;
import com.company.requirement.dto.response.RequirementVO;
import com.company.requirement.entity.*;
import com.company.requirement.mapper.*;
import com.company.requirement.service.IterationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class IterationServiceImpl implements IterationService {

    private final IterationMapper iterationMapper;
    private final RequirementMapper requirementMapper;
    private final OperationLogMapper operationLogMapper;

    public IterationServiceImpl(IterationMapper iterationMapper, RequirementMapper requirementMapper,
                                OperationLogMapper operationLogMapper) {
        this.iterationMapper = iterationMapper;
        this.requirementMapper = requirementMapper;
        this.operationLogMapper = operationLogMapper;
    }

    @Override
    public IPage<IterationVO> listIterations(Long projectId, Long versionId, String status, String keyword, int page, int pageSize) {
        Page<Iteration> pg = new Page<>(page, pageSize);
        LambdaQueryWrapper<Iteration> wrapper = new LambdaQueryWrapper<>();
        if (projectId != null) wrapper.eq(Iteration::getProjectId, projectId);
        if (versionId != null) wrapper.eq(Iteration::getVersionId, versionId);
        if (status != null && !status.isEmpty()) wrapper.eq(Iteration::getStatus, status);
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Iteration::getName, keyword)
                    .or().like(Iteration::getDescription, keyword));
        }
        wrapper.orderByDesc(Iteration::getCreatedAt);
        return iterationMapper.selectPage(pg, wrapper).convert(this::toVO);
    }

    @Override
    public IterationVO getIteration(Long id) {
        Iteration i = iterationMapper.selectById(id);
        if (i == null || i.getDeleted() == 1) throw BusinessException.notFound("迭代不存在");
        return toVO(i);
    }

    @Override
    @Transactional
    public IterationVO createIteration(Iteration iteration) {
        iterationMapper.insert(iteration);
        OperationLog log = new OperationLog();
        log.setTargetType("iteration");
        log.setTargetId(iteration.getId());
        log.setAction("创建");
        log.setOperator("system");
        log.setDescription("创建迭代: " + iteration.getName());
        operationLogMapper.insert(log);
        return toVO(iteration);
    }

    @Override
    @Transactional
    public IterationVO updateIteration(Long id, Iteration iteration) {
        Iteration existing = iterationMapper.selectById(id);
        if (existing == null || existing.getDeleted() == 1) throw BusinessException.notFound("迭代不存在");
        iteration.setId(id);
        iterationMapper.updateById(iteration);
        return toVO(iterationMapper.selectById(id));
    }

    @Override
    @Transactional
    public void deleteIteration(Long id) {
        Iteration i = iterationMapper.selectById(id);
        if (i == null || i.getDeleted() == 1) throw BusinessException.notFound("迭代不存在");
        iterationMapper.deleteById(id);
    }

    @Override
    public List<RequirementVO> getArs(Long id) {
        return requirementMapper.selectList(
                new LambdaQueryWrapper<Requirement>().eq(Requirement::getIterationId, id))
                .stream().map(r -> {
                    RequirementVO vo = new RequirementVO();
                    vo.setId(r.getId());
                    vo.setCode(r.getCode());
                    vo.setName(r.getName());
                    vo.setType(r.getType());
                    vo.setStatus(r.getStatus());
                    vo.setPriority(r.getPriority());
                    return vo;
                }).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getStats(Long id) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalArs", requirementMapper.selectCount(
                new LambdaQueryWrapper<Requirement>().eq(Requirement::getIterationId, id)));
        return stats;
    }

    @Override
    public List<OperationLogVO> getLogs(Long id) {
        return operationLogMapper.selectList(
                new LambdaQueryWrapper<OperationLog>()
                        .eq(OperationLog::getTargetType, "iteration")
                        .eq(OperationLog::getTargetId, id)
                        .orderByDesc(OperationLog::getTimestamp))
                .stream().map(l -> {
                    OperationLogVO vo = new OperationLogVO();
                    vo.setId(l.getId());
                    vo.setTargetType(l.getTargetType());
                    vo.setTargetId(l.getTargetId());
                    vo.setAction(l.getAction());
                    vo.setOperator(l.getOperator());
                    vo.setTimestamp(l.getTimestamp());
                    vo.setDescription(l.getDescription());
                    return vo;
                }).collect(Collectors.toList());
    }

    @Override
    public List<Iteration> exportAll(Long projectId, Long versionId, String status, String keyword) {
        LambdaQueryWrapper<Iteration> wrapper = new LambdaQueryWrapper<>();
        if (projectId != null) wrapper.eq(Iteration::getProjectId, projectId);
        if (versionId != null) wrapper.eq(Iteration::getVersionId, versionId);
        if (status != null && !status.isEmpty()) wrapper.eq(Iteration::getStatus, status);
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Iteration::getName, keyword).or().like(Iteration::getDescription, keyword));
        }
        return iterationMapper.selectList(wrapper);
    }

    private IterationVO toVO(Iteration i) {
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
}
