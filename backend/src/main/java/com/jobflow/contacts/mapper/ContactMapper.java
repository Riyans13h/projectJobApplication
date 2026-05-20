package com.jobflow.contacts.mapper;

import com.jobflow.auth.entity.User;
import com.jobflow.contacts.dto.ContactResponse;
import com.jobflow.contacts.dto.CreateContactRequest;
import com.jobflow.contacts.dto.UpdateContactRequest;
import com.jobflow.contacts.entity.Contact;
import org.springframework.stereotype.Component;

@Component
public class ContactMapper {

    /**
     * Map CreateContactRequest to Contact entity
     */
    public Contact toEntity(CreateContactRequest request, User user) {
        return Contact.builder()
                .user(user)
                .name(request.getName())
                .company(request.getCompany())
                .role(request.getRole())
                .level(request.getLevel())
                .linkedinUrl(request.getLinkedinUrl())
                .email(request.getEmail())
                .phone(request.getPhone())
                .contactType(request.getContactType())
                .status(request.getStatus() != null ? request.getStatus() :
                       com.jobflow.contacts.enums.ContactStatus.NOT_CONTACTED)
                .helpScore(request.getHelpScore())
                .source(request.getSource())
                .notes(request.getNotes())
                .lastContactDate(request.getLastContactDate())
                .nextFollowupDate(request.getNextFollowupDate())
                .build();
    }

    /**
     * Map UpdateContactRequest to Contact entity
     */
    public void updateEntity(UpdateContactRequest request, Contact contact) {
        if (request.getName() != null) {
            contact.setName(request.getName());
        }
        if (request.getCompany() != null) {
            contact.setCompany(request.getCompany());
        }
        if (request.getRole() != null) {
            contact.setRole(request.getRole());
        }
        if (request.getLevel() != null) {
            contact.setLevel(request.getLevel());
        }
        if (request.getLinkedinUrl() != null) {
            contact.setLinkedinUrl(request.getLinkedinUrl());
        }
        if (request.getEmail() != null) {
            contact.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            contact.setPhone(request.getPhone());
        }
        if (request.getContactType() != null) {
            contact.setContactType(request.getContactType());
        }
        if (request.getStatus() != null) {
            contact.setStatus(request.getStatus());
        }
        if (request.getHelpScore() != null) {
            contact.setHelpScore(request.getHelpScore());
        }
        if (request.getSource() != null) {
            contact.setSource(request.getSource());
        }
        if (request.getNotes() != null) {
            contact.setNotes(request.getNotes());
        }
        if (request.getLastContactDate() != null) {
            contact.setLastContactDate(request.getLastContactDate());
        }
        if (request.getNextFollowupDate() != null) {
            contact.setNextFollowupDate(request.getNextFollowupDate());
        }
    }

    /**
     * Map Contact entity to ContactResponse
     */
    public ContactResponse toResponse(Contact contact) {
        return ContactResponse.builder()
                .id(contact.getId())
                .userId(contact.getUser().getId())
                .name(contact.getName())
                .company(contact.getCompany())
                .role(contact.getRole())
                .level(contact.getLevel())
                .linkedinUrl(contact.getLinkedinUrl())
                .email(contact.getEmail())
                .phone(contact.getPhone())
                .contactType(contact.getContactType())
                .status(contact.getStatus())
                .helpScore(contact.getHelpScore())
                .source(contact.getSource())
                .notes(contact.getNotes())
                .lastContactDate(contact.getLastContactDate())
                .nextFollowupDate(contact.getNextFollowupDate())
                .createdAt(contact.getCreatedAt())
                .updatedAt(contact.getUpdatedAt())
                .build();
    }
}
