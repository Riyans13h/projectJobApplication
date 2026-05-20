package com.jobflow.contacts.dto;

import com.jobflow.contacts.enums.ContactStatus;
import com.jobflow.contacts.enums.ContactType;
import com.jobflow.contacts.enums.HelpScore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactResponse {

    private Long id;

    private Long userId;

    private String name;

    private String company;

    private String role;

    private String level;

    private String linkedinUrl;

    private String email;

    private String phone;

    private ContactType contactType;

    private ContactStatus status;

    private HelpScore helpScore;

    private String source;

    private String notes;

    private LocalDate lastContactDate;

    private LocalDate nextFollowupDate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
