package com.company.requirement.common;

import org.springframework.stereotype.Component;

import java.time.Year;
import java.util.function.Function;

@Component
public class CodeGenerator {

    public String generate(String prefix, Function<String, String> maxCodeQuery) {
        String year = String.valueOf(Year.now().getValue());
        String likePattern = prefix + "-" + year + "-%";
        String maxCode = maxCodeQuery.apply(likePattern);

        int nextSeq = 1;
        if (maxCode != null && !maxCode.isEmpty()) {
            String seqStr = maxCode.substring(maxCode.lastIndexOf("-") + 1);
            nextSeq = Integer.parseInt(seqStr) + 1;
        }

        return String.format("%s-%s-%03d", prefix, year, nextSeq);
    }

    public String generateRequirementCode(String type, Function<String, String> maxCodeQuery) {
        return generate(type, maxCodeQuery);
    }

    public String generateTaskCode(Function<String, String> maxCodeQuery) {
        return generate("TASK", maxCodeQuery);
    }

    public String generateTestCaseCode(Function<String, String> maxCodeQuery) {
        return generate("TC", maxCodeQuery);
    }
}
