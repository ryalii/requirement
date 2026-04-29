package com.company.requirement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.company.requirement.common.BusinessException;
import com.company.requirement.dto.response.IterationVO;
import com.company.requirement.dto.response.OperationLogVO;
import com.company.requirement.dto.response.VersionVO;
import com.company.requirement.entity.*;
import com.company.requirement.mapper.*;
import com.company.requirement.service.VersionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class VersionServiceImpl implements VersionService {

    private final VersionMapper versionMapper;
    private final IterationMapper iterationMapper;
    private final OperationLogMapper operationLogMapper;

    public VersionServiceImpl(VersionMapper versionMapper, IterationMapper iterationMapper,
                              OperationLogMapper operationLogMapper) {
        this.versionMapper = versionMapper;
        this.iterationMapper = iterationMapper;
        this.operationLogMapper = operationLogMapper;
    }

    @Override
    public IPage<VersionVO> listVersions(Long projectId, String status, String keyword, int page, int pageSize) {
        Page<Version> pg = new Page<>(page, pageSize);
        LambdaQueryWrapper<Version> wrapper = new LambdaQueryWrapper<>();
        if (projectId != null) wrapper.eq(Version::getProjectId, projectId);
        if (status != null && !status.isEmpty()) wrapper.eq(Version::getStatus, status);
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Version::getVersionNumber, keyword)
                    .or().like(Version::getDescription, keyword));
        }
        wrapper.orderByDesc(Version::getCreatedAt);
        return versionMapper.selectPage(pg, wrapper).convert(this::toVO);
    }

    @Override
    public VersionVO getVersion(Long id) {
        Version v = versionMapper.selectById(id);
        if (v == null || v.getDeleted() == 1) throw BusinessException.notFound("版本不存在");
        return toVO(v);
    }

    @Override
    @Transactional
    public VersionVO createVersion(Version version) {
        versionMapper.insert(version);
        OperationLog log = new OperationLog();
        log.setTargetType("version");
        log.setTargetId(version.getId());
        log.setAction("创建");
        log.setOperator("system");
        log.setDescription("创建版本: " + version.getVersionNumber());
        operationLogMapper.insert(log);
        return toVO(version);
    }

    @Override
    @Transactional
    public VersionVO updateVersion(Long id, Version version) {
        Version existing = versionMapper.selectById(id);
        if (existing == null || existing.getDeleted() == 1) throw BusinessException.notFound("版本不存在");
        version.setId(id);
        versionMapper.updateById(version);
        return toVO(versionMapper.selectById(id));
    }

    @Override
    @Transactional
    public void deleteVersion(Long id) {
        Version v = versionMapper.selectById(id);
        if (v == null || v.getDeleted() == 1) throw BusinessException.notFound("版本不存在");
        versionMapper.deleteById(id);
    }

    @Override
    public List<IterationVO> getIterations(Long id) {
        return iterationMapper.selectList(
                new LambdaQueryWrapper<Iteration>().eq(Iteration::getVersionId, id))
                .stream().map(i -> {
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
                }).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getStats(Long id) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", iterationMapper.selectCount(new LambdaQueryWrapper<Iteration>().eq(Iteration::getVersionId, id)));
        stats.put("completed", iterationMapper.selectCount(
                new LambdaQueryWrapper<Iteration>().eq(Iteration::getVersionId, id).eq(Iteration::getStatus, "已完成")));
        return stats;
    }

    @Override
    public List<OperationLogVO> getLogs(Long id) {
        return operationLogMapper.selectList(
                new LambdaQueryWrapper<OperationLog>()
                        .eq(OperationLog::getTargetType, "version")
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
    public List<Version> exportAll(Long projectId, String status, String keyword) {
        LambdaQueryWrapper<Version> wrapper = new LambdaQueryWrapper<>();
        if (projectId != null) wrapper.eq(Version::getProjectId, projectId);
        if (status != null && !status.isEmpty()) wrapper.eq(Version::getStatus, status);
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Version::getVersionNumber, keyword).or().like(Version::getDescription, keyword));
        }
        return versionMapper.selectList(wrapper);
    }

    private VersionVO toVO(Version v) {
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
}
