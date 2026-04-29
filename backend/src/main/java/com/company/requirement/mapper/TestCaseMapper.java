package com.company.requirement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.company.requirement.entity.TestCase;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TestCaseMapper extends BaseMapper<TestCase> {
}
