package com.jobflow.contacts.dto;

import com.jobflow.contacts.enums.ContactStatus;
import com.jobflow.contacts.enums.ContactType;
import com.jobflow.contacts.enums.HelpScore;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateContactRequest {

    @NotBlank(message = "Contact name is required")
    @Size(max = 150, message = "Contact name must not exceed 150 characters")
    private String name;

    @Size(max = 150, message = "Company must not exceed 150 characters")
    private String company;

    @Size(max = 150, message = "Role must not exceed 150 characters")
    private String role;

    @Size(max = 100, message = "Level must not exceed 100 characters")
    private String level;

    @Size(max = 500, message = "LinkedIn URL must not exceed 500 characters")
    private String linkedinUrl;

    @Email(message = "Email should be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @Pattern(regexp = "^[+]?[0-9\\-\\s()]{7,30}$", message = "Phone should be valid")
    private String phone;

    @NotNull(message = "Contact type is required")
    private ContactType contactType;

    private ContactStatus status;

    private HelpScore helpScore;

    @Size(max = 150, message = "Source must not exceed 150 characters")
    private String source;

    private String notes;

    private LocalDate lastContactDate;

    private LocalDate nextFollowupDate;
}
