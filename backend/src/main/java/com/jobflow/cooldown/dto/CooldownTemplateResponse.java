package com.jobflow.cooldown.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CooldownTemplateResponse {

    private String name;
    private String description;
    private Integer cooldownPeriod;
}
