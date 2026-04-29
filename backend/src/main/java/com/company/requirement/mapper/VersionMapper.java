package com.company.requirement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.company.requirement.entity.Version;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface VersionMapper extends BaseMapper<Version> {
}
