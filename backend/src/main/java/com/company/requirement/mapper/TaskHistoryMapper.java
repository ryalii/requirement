package com.company.requirement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.company.requirement.entity.TaskHistory;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TaskHistoryMapper extends BaseMapper<TaskHistory> {
}
