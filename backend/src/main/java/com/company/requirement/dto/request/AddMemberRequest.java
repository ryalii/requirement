package com.company.requirement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddMemberRequest {
    @NotBlank(message = "成员名称不能为空")
    private String name;

    @NotBlank(message = "角色不能为空")
    private String role;

    private String email;
    private String phone;
}
