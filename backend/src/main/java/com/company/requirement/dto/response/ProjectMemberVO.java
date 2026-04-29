package com.company.requirement.dto.response;

import lombok.Data;

@Data
public class ProjectMemberVO {
    private Long id;
    private Long projectId;
    private String name;
    private String role;
    private String email;
    private String phone;
}
