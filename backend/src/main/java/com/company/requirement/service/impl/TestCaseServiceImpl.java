package com.company.requirement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.company.requirement.common.BusinessException;
import com.company.requirement.common.CodeGenerator;
import com.company.requirement.dto.request.*;
import com.company.requirement.dto.response.TestCaseStatsVO;
import com.company.requirement.dto.response.TestCaseVO;
import com.company.requirement.entity.Requirement;
import com.company.requirement.entity.TestCase;
import com.company.requirement.mapper.RequirementMapper;
import com.company.requirement.mapper.TestCaseMapper;
import com.company.requirement.service.TestCaseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TestCaseServiceImpl implements TestCaseService {

    private final TestCaseMapper testCaseMapper;
    private final RequirementMapper requirementMapper;
    private final CodeGenerator codeGenerator;

    public TestCaseServiceImpl(TestCaseMapper testCaseMapper, RequirementMapper requirementMapper, CodeGenerator codeGenerator) {
        this.testCaseMapper = testCaseMapper;
        this.requirementMapper = requirementMapper;
        this.codeGenerator = codeGenerator;
    }

    @Override
    public List<TestCaseVO> listTestCases(Long arId) {
        return testCaseMapper.selectList(
                new LambdaQueryWrapper<TestCase>().eq(TestCase::getArId, arId))
                .stream().map(this::toVO).collect(Collectors.toList());
    }

    @Override
    public TestCaseStatsVO getStats(Long arId) {
        List<TestCase> all = testCaseMapper.selectList(
                new LambdaQueryWrapper<TestCase>().eq(TestCase::getArId, arId));
        TestCaseStatsVO stats = new TestCaseStatsVO();
        stats.setTotal(all.size());
        stats.setPassed(all.stream().filter(tc -> "通过".equals(tc.getStatus())).count());
        stats.setFailed(all.stream().filter(tc -> "失败".equals(tc.getStatus())).count());
        stats.setPending(all.stream().filter(tc -> "未执行".equals(tc.getStatus())).count());
        stats.setPassRate(stats.getTotal() > 0 ? (double) stats.getPassed() / stats.getTotal() * 100 : 0);
        stats.setExecutionRate(stats.getTotal() > 0 ? (double) (stats.getPassed() + stats.getFailed()) / stats.getTotal() * 100 : 0);
        return stats;
    }

    @Override
    @Transactional
    public TestCaseVO createTestCase(Long arId, TestCaseCreateRequest request) {
        Requirement ar = requirementMapper.selectById(arId);
        if (ar == null || ar.getDeleted() == 1) {
            throw BusinessException.notFound("关联AR需求不存在");
        }

        TestCase tc = new TestCase();
        tc.setName(request.getName());
        tc.setPriority(request.getPriority() != null ? request.getPriority() : "中");
        tc.setStatus(request.getStatus() != null ? request.getStatus() : "未执行");
        tc.setArId(arId);

        String code = codeGenerator.generateTestCaseCode(
                p -> { TestCase t = testCaseMapper.selectOne(
                        new LambdaQueryWrapper<TestCase>().likeRight(TestCase::getCode, p).orderByDesc(TestCase::getCode).last("LIMIT 1"));
                    return t != null ? t.getCode() : null; });
        tc.setCode(code);

        testCaseMapper.insert(tc);

        // Update requirement test case count
        updateTestCaseCount(arId);

        return toVO(tc);
    }

    @Override
    @Transactional
    public TestCaseVO updateTestCase(Long id, TestCaseUpdateRequest request) {
        TestCase tc = testCaseMapper.selectById(id);
        if (tc == null || tc.getDeleted() == 1) {
            throw BusinessException.notFound("测试用例不存在");
        }
        if (request.getName() != null) tc.setName(request.getName());
        if (request.getPriority() != null) tc.setPriority(request.getPriority());
        if (request.getStatus() != null) tc.setStatus(request.getStatus());
        testCaseMapper.updateById(tc);
        return toVO(tc);
    }

    @Override
    @Transactional
    public void deleteTestCase(Long id) {
        TestCase tc = testCaseMapper.selectById(id);
        if (tc == null || tc.getDeleted() == 1) {
            throw BusinessException.notFound("测试用例不存在");
        }
        Long arId = tc.getArId();
        testCaseMapper.deleteById(id);
        updateTestCaseCount(arId);
    }

    @Override
    @Transactional
    public void batchDelete(BatchDeleteRequest request) {
        for (Long id : request.getIds()) {
            TestCase tc = testCaseMapper.selectById(id);
            if (tc != null) {
                Long arId = tc.getArId();
                testCaseMapper.deleteById(id);
                updateTestCaseCount(arId);
            }
        }
    }

    @Override
    @Transactional
    public TestCaseVO changeStatus(Long id, TestCaseStatusRequest request) {
        TestCase tc = testCaseMapper.selectById(id);
        if (tc == null || tc.getDeleted() == 1) {
            throw BusinessException.notFound("测试用例不存在");
        }
        tc.setStatus(request.getStatus());
        if (request.getExecutedAt() != null) {
            tc.setExecutedAt(LocalDate.parse(request.getExecutedAt()));
        }
        testCaseMapper.updateById(tc);
        return toVO(tc);
    }

    @Override
    @Transactional
    public void batchChangeStatus(BatchStatusRequest request) {
        for (Long id : request.getIds()) {
            TestCase tc = testCaseMapper.selectById(id);
            if (tc != null) {
                tc.setStatus(request.getStatus());
                testCaseMapper.updateById(tc);
            }
        }
    }

    private void updateTestCaseCount(Long arId) {
        int count = testCaseMapper.selectCount(
                new LambdaQueryWrapper<TestCase>().eq(TestCase::getArId, arId)).intValue();
        Requirement ar = requirementMapper.selectById(arId);
        if (ar != null) {
            ar.setTestCaseCount(count);
            requirementMapper.updateById(ar);
        }
    }

    private TestCaseVO toVO(TestCase tc) {
        TestCaseVO vo = new TestCaseVO();
        vo.setId(tc.getId());
        vo.setCode(tc.getCode());
        vo.setName(tc.getName());
        vo.setStatus(tc.getStatus());
        vo.setPriority(tc.getPriority());
        vo.setExecutedAt(tc.getExecutedAt());
        vo.setArId(tc.getArId());
        vo.setCreatedAt(tc.getCreatedAt());
        vo.setUpdatedAt(tc.getUpdatedAt());
        return vo;
    }
}
