package com.jobflow.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeExtraction {

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private List<String> skills;

    private String currentCompany;

    private String currentRole;

    private String education;
}
