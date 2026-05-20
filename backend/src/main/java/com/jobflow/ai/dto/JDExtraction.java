package com.jobflow.ai.dto;

import com.jobflow.applications.enums.EmploymentType;
import com.jobflow.applications.enums.WorkMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JDExtraction {

    private String companyName;

    private String role;

    private String jobId;

    private String location;

    private WorkMode workMode;

    private EmploymentType employmentType;

    private List<String> skillsRequired;
}
