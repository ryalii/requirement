package com.company.requirement.common;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class PageResult<T> extends Result<List<T>> {
    private int page;
    private int pageSize;
    private long total;

    public PageResult() {}

    public PageResult(int page, int pageSize, long total, List<T> list) {
        super(200, "success", list);
        this.page = page;
        this.pageSize = pageSize;
        this.total = total;
    }

    public static <T> PageResult<T> of(int page, int pageSize, long total, List<T> list) {
        return new PageResult<>(page, pageSize, total, list);
    }
}
