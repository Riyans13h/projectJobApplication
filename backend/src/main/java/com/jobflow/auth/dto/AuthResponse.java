package com.jobflow.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String accessToken;
    private String tokenType;
    private Long expiresIn;
}
