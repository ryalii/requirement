package com.company.requirement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.company.requirement.common.BusinessException;
import com.company.requirement.common.CodeGenerator;
import com.company.requirement.dto.request.ConvertToIrRequest;
import com.company.requirement.dto.request.DecomposeRequest;
import com.company.requirement.dto.request.RequirementCreateRequest;
import com.company.requirement.dto.request.RequirementUpdateRequest;
import com.company.requirement.dto.response.RequirementAncestorVO;
import com.company.requirement.dto.response.RequirementTreeVO;
import com.company.requirement.dto.response.RequirementVO;
import com.company.requirement.entity.Requirement;
import com.company.requirement.mapper.RequirementMapper;
import com.company.requirement.service.RequirementService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RequirementServiceImpl implements RequirementService {

    private final RequirementMapper requirementMapper;
    private final CodeGenerator codeGenerator;

    public RequirementServiceImpl(RequirementMapper requirementMapper, CodeGenerator codeGenerator) {
        this.requirementMapper = requirementMapper;
        this.codeGenerator = codeGenerator;
    }

    @Override
    public IPage<RequirementVO> listRequirements(String type, String status, String keyword, int page, int pageSize) {
        Page<Requirement> pg = new Page<>(page, pageSize);
        LambdaQueryWrapper<Requirement> wrapper = new LambdaQueryWrapper<>();

        if (type != null && !type.isEmpty()) {
            wrapper.eq(Requirement::getType, type);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Requirement::getStatus, status);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Requirement::getName, keyword)
                    .or().like(Requirement::getCode, keyword)
                    .or().like(Requirement::getDescription, keyword));
        }
        wrapper.orderByDesc(Requirement::getCreatedAt);

        IPage<Requirement> result = requirementMapper.selectPage(pg, wrapper);
        return result.convert(this::toVO);
    }

    @Override
    public RequirementVO getRequirement(Long id) {
        Requirement req = requirementMapper.selectById(id);
        if (req == null || req.getDeleted() == 1) {
            throw BusinessException.notFound("需求不存在");
        }
        RequirementVO vo = toVO(req);

        if ("AR".equals(req.getType())) {
            // test cases would be fetched separately
        } else if ("IR".equals(req.getType()) || "SR".equals(req.getType())) {
            Long count = requirementMapper.selectCount(
                    new LambdaQueryWrapper<Requirement>().eq(Requirement::getParentId, id));
            vo.setChildrenCount(count.intValue());
        }
        return vo;
    }

    @Override
    @Transactional
    public RequirementVO createRequirement(RequirementCreateRequest request) {
        Requirement req = new Requirement();
        req.setName(request.getName());
        req.setType(request.getType());
        req.setCustomer(request.getCustomer());
        req.setProject(request.getProject());
        req.setExpectedDate(LocalDate.parse(request.getExpectedDate()));
        req.setStatus(request.getStatus() != null ? request.getStatus() : "待分析");
        req.setPriority(request.getPriority() != null ? request.getPriority() : "中");
        req.setDescription(request.getDescription());
        req.setParentId(request.getParentId());
        req.setIterationId(request.getIterationId());
        req.setFrontend(request.getFrontend());
        req.setBackend(request.getBackend());
        req.setTester(request.getTester());
        req.setTestCaseCount(0);

        // Generate code
        String code = codeGenerator.generateRequirementCode(request.getType(),
                pattern -> {
                    var wrapper = new LambdaQueryWrapper<Requirement>()
                            .likeRight(Requirement::getCode, pattern)
                            .orderByDesc(Requirement::getCode)
                            .last("LIMIT 1");
                    Requirement r = requirementMapper.selectOne(wrapper);
                    return r != null ? r.getCode() : null;
                });
        req.setCode(code);

        requirementMapper.insert(req);
        return toVO(req);
    }

    @Override
    @Transactional
    public RequirementVO updateRequirement(Long id, RequirementUpdateRequest request) {
        Requirement existing = requirementMapper.selectById(id);
        if (existing == null || existing.getDeleted() == 1) {
            throw BusinessException.notFound("需求不存在");
        }

        // Concurrent edit check via updated_at
        if (request.getUpdatedAt() != null) {
            LocalDateTime clientUpdatedAt = LocalDateTime.parse(request.getUpdatedAt(), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            if (existing.getUpdatedAt() != null && clientUpdatedAt.isBefore(existing.getUpdatedAt())) {
                throw BusinessException.conflict("数据已被其他用户修改，请刷新后重试");
            }
        }

        if (request.getName() != null) existing.setName(request.getName());
        if (request.getCustomer() != null) existing.setCustomer(request.getCustomer());
        if (request.getProject() != null) existing.setProject(request.getProject());
        if (request.getExpectedDate() != null) existing.setExpectedDate(LocalDate.parse(request.getExpectedDate()));
        if (request.getStatus() != null) existing.setStatus(request.getStatus());
        if (request.getPriority() != null) existing.setPriority(request.getPriority());
        if (request.getDescription() != null) existing.setDescription(request.getDescription());
        if (request.getIterationId() != null) existing.setIterationId(request.getIterationId());
        if (request.getFrontend() != null) existing.setFrontend(request.getFrontend());
        if (request.getBackend() != null) existing.setBackend(request.getBackend());
        if (request.getTester() != null) existing.setTester(request.getTester());

        requirementMapper.updateById(existing);
        return toVO(existing);
    }

    @Override
    @Transactional
    public void deleteRequirement(Long id) {
        Requirement req = requirementMapper.selectById(id);
        if (req == null || req.getDeleted() == 1) {
            throw BusinessException.notFound("需求不存在");
        }
        requirementMapper.deleteById(id);
    }

    @Override
    @Transactional
    public RequirementVO convertToIr(Long id, ConvertToIrRequest request) {
        Requirement lmt = requirementMapper.selectById(id);
        if (lmt == null || lmt.getDeleted() == 1) {
            throw BusinessException.notFound("需求不存在");
        }
        if (!"LMT".equals(lmt.getType())) {
            throw BusinessException.badRequest("只有LMT类型需求可以转换为IR");
        }
        if (lmt.getIrId() != null) {
            throw BusinessException.badRequest("该LMT已关联IR，请勿重复转换");
        }

        // Create IR
        Requirement ir = new Requirement();
        ir.setName(request.getName() != null ? request.getName() : lmt.getName() + "-IR");
        ir.setType("IR");
        ir.setCustomer(lmt.getCustomer());
        ir.setProject(lmt.getProject());
        ir.setExpectedDate(request.getExpectedDate() != null ?
                LocalDate.parse(request.getExpectedDate()) : lmt.getExpectedDate());
        ir.setStatus("待分析");
        ir.setPriority(request.getPriority() != null ? request.getPriority() : lmt.getPriority());
        ir.setDescription(request.getDescription());
        ir.setTestCaseCount(0);

        String code = codeGenerator.generateRequirementCode("IR",
                p -> { Requirement r = requirementMapper.selectOne(
                        new LambdaQueryWrapper<Requirement>().likeRight(Requirement::getCode, p).orderByDesc(Requirement::getCode).last("LIMIT 1"));
                    return r != null ? r.getCode() : null; });
        ir.setCode(code);
        requirementMapper.insert(ir);

        // Update LMT
        lmt.setIrId(ir.getId());
        requirementMapper.updateById(lmt);

        return toVO(ir);
    }

    @Override
    @Transactional
    public List<RequirementVO> decompose(Long id, DecomposeRequest request) {
        Requirement parent = requirementMapper.selectById(id);
        if (parent == null || parent.getDeleted() == 1) {
            throw BusinessException.notFound("需求不存在");
        }

        String childType;
        if ("IR".equals(parent.getType())) {
            childType = "SR";
        } else if ("SR".equals(parent.getType())) {
            childType = "AR";
        } else {
            throw BusinessException.badRequest("只有IR/SR类型需求可以拆解");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw BusinessException.badRequest("拆解子项不能为空");
        }

        List<RequirementVO> results = new ArrayList<>();
        for (DecomposeRequest.DecomposeItem item : request.getItems()) {
            Requirement child = new Requirement();
            child.setName(item.getName());
            child.setType(childType);
            child.setCustomer(parent.getCustomer());
            child.setProject(parent.getProject());
            child.setExpectedDate(parent.getExpectedDate());
            child.setStatus("待分析");
            child.setPriority(item.getPriority() != null ? item.getPriority() : "中");
            child.setDescription(item.getDescription());
            child.setParentId(parent.getId());
            child.setTestCaseCount(0);

            String code = codeGenerator.generateRequirementCode(childType,
                    p -> { Requirement r = requirementMapper.selectOne(
                            new LambdaQueryWrapper<Requirement>().likeRight(Requirement::getCode, p).orderByDesc(Requirement::getCode).last("LIMIT 1"));
                        return r != null ? r.getCode() : null; });
            child.setCode(code);
            requirementMapper.insert(child);
            results.add(toVO(child));
        }
        return results;
    }

    @Override
    public RequirementTreeVO getRequirementTree(Long id) {
        Requirement req = requirementMapper.selectById(id);
        if (req == null || req.getDeleted() == 1) {
            throw BusinessException.notFound("需求不存在");
        }
        RequirementTreeVO tree = new RequirementTreeVO();
        tree.setRequirement(toVO(req));
        tree.setChildren(buildSubTree(id));
        return tree;
    }

    private List<RequirementTreeVO> buildSubTree(Long parentId) {
        List<Requirement> children = requirementMapper.selectList(
                new LambdaQueryWrapper<Requirement>().eq(Requirement::getParentId, parentId));
        return children.stream().map(child -> {
            RequirementTreeVO node = new RequirementTreeVO();
            node.setRequirement(toVO(child));
            node.setChildren(buildSubTree(child.getId()));
            return node;
        }).collect(Collectors.toList());
    }

    @Override
    public List<RequirementVO> getChildren(Long id) {
        List<Requirement> children = requirementMapper.selectList(
                new LambdaQueryWrapper<Requirement>().eq(Requirement::getParentId, id));
        return children.stream().map(this::toVO).collect(Collectors.toList());
    }

    @Override
    public List<RequirementAncestorVO> getAncestors(Long id) {
        List<RequirementAncestorVO> ancestors = new ArrayList<>();
        Requirement current = requirementMapper.selectById(id);
        while (current != null && current.getParentId() != null) {
            Requirement parent = requirementMapper.selectById(current.getParentId());
            if (parent != null) {
                RequirementAncestorVO vo = new RequirementAncestorVO();
                vo.setId(parent.getId());
                vo.setCode(parent.getCode());
                vo.setType(parent.getType());
                vo.setName(parent.getName());
                ancestors.add(0, vo);
                current = parent;
            } else {
                break;
            }
        }
        return ancestors;
    }

    @Override
    public List<Requirement> exportAll(String type, String status, String keyword) {
        LambdaQueryWrapper<Requirement> wrapper = buildFilterWrapper(type, status, keyword);
        wrapper.orderByDesc(Requirement::getCreatedAt);
        return requirementMapper.selectList(wrapper);
    }

    private LambdaQueryWrapper<Requirement> buildFilterWrapper(String type, String status, String keyword) {
        LambdaQueryWrapper<Requirement> wrapper = new LambdaQueryWrapper<>();
        if (type != null && !type.isEmpty()) wrapper.eq(Requirement::getType, type);
        if (status != null && !status.isEmpty()) wrapper.eq(Requirement::getStatus, status);
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Requirement::getName, keyword)
                    .or().like(Requirement::getCode, keyword)
                    .or().like(Requirement::getDescription, keyword));
        }
        return wrapper;
    }

    private RequirementVO toVO(Requirement req) {
        RequirementVO vo = new RequirementVO();
        vo.setId(req.getId());
        vo.setCode(req.getCode());
        vo.setName(req.getName());
        vo.setType(req.getType());
        vo.setCustomer(req.getCustomer());
        vo.setProject(req.getProject());
        vo.setExpectedDate(req.getExpectedDate());
        vo.setStatus(req.getStatus());
        vo.setPriority(req.getPriority());
        vo.setDescription(req.getDescription());
        vo.setParentId(req.getParentId());
        vo.setIrId(req.getIrId());
        vo.setIterationId(req.getIterationId());
        vo.setFrontend(req.getFrontend());
        vo.setBackend(req.getBackend());
        vo.setTester(req.getTester());
        vo.setTestCaseCount(req.getTestCaseCount());
        vo.setCreatedAt(req.getCreatedAt());
        vo.setUpdatedAt(req.getUpdatedAt());

        // Set parent info
        if (req.getParentId() != null) {
            Requirement parent = requirementMapper.selectById(req.getParentId());
            if (parent != null) {
                vo.setParentCode(parent.getCode());
                vo.setParentType(parent.getType());
            }
        }
        return vo;
    }
}
