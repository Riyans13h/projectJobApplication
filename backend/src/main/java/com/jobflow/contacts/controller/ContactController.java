package com.jobflow.contacts.controller;

import com.jobflow.auth.service.JwtService;
import com.jobflow.contacts.dto.ContactResponse;
import com.jobflow.contacts.dto.CreateContactRequest;
import com.jobflow.contacts.dto.UpdateContactRequest;
import com.jobflow.contacts.enums.ContactStatus;
import com.jobflow.contacts.enums.ContactType;
import com.jobflow.contacts.enums.HelpScore;
import com.jobflow.contacts.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/contacts")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${spring.security.cors.allowed-origins}")
public class ContactController {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "name",
            "company",
            "role",
            "contactType",
            "status",
            "helpScore",
            "lastContactDate",
            "nextFollowupDate",
            "createdAt",
            "updatedAt"
    );

    private final ContactService contactService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<ContactResponse> createContact(
            @Valid @RequestBody CreateContactRequest request,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Create contact request received");

        Long userId = extractUserIdFromToken(authHeader);
        ContactResponse response = contactService.createContact(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<ContactResponse>> getAllContacts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get all contacts request received");

        Long userId = extractUserIdFromToken(authHeader);
        Pageable pageable = createPageable(page, size, sortBy, sortDir);
        Page<ContactResponse> contacts = contactService.getAllContacts(userId, pageable);
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactResponse> getContactById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get contact by id: {}", id);

        Long userId = extractUserIdFromToken(authHeader);
        ContactResponse response = contactService.getContactById(id, userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactResponse> updateContact(
            @PathVariable Long id,
            @Valid @RequestBody UpdateContactRequest request,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Update contact request received for id: {}", id);

        Long userId = extractUserIdFromToken(authHeader);
        ContactResponse response = contactService.updateContact(id, request, userId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ContactResponse> updateContactStatus(
            @PathVariable Long id,
            @RequestParam ContactStatus status,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Update contact status request received for id: {}", id);

        Long userId = extractUserIdFromToken(authHeader);
        ContactResponse response = contactService.updateContactStatus(id, status, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Delete contact request received for id: {}", id);

        Long userId = extractUserIdFromToken(authHeader);
        contactService.deleteContact(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/filter/company")
    public ResponseEntity<Page<ContactResponse>> getContactsByCompany(
            @RequestParam String company,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get contacts by company: {}", company);

        Long userId = extractUserIdFromToken(authHeader);
        Pageable pageable = createPageable(page, size, sortBy, sortDir);
        Page<ContactResponse> contacts = contactService.getContactsByCompany(userId, company, pageable);
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/filter/type")
    public ResponseEntity<Page<ContactResponse>> getContactsByContactType(
            @RequestParam ContactType contactType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get contacts by contact type: {}", contactType);

        Long userId = extractUserIdFromToken(authHeader);
        Pageable pageable = createPageable(page, size, sortBy, sortDir);
        Page<ContactResponse> contacts = contactService.getContactsByContactType(userId, contactType, pageable);
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/filter/status")
    public ResponseEntity<Page<ContactResponse>> getContactsByStatus(
            @RequestParam ContactStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get contacts by status: {}", status);

        Long userId = extractUserIdFromToken(authHeader);
        Pageable pageable = createPageable(page, size, sortBy, sortDir);
        Page<ContactResponse> contacts = contactService.getContactsByStatus(userId, status, pageable);
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/filter/help-score")
    public ResponseEntity<Page<ContactResponse>> getContactsByHelpScore(
            @RequestParam HelpScore helpScore,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get contacts by help score: {}", helpScore);

        Long userId = extractUserIdFromToken(authHeader);
        Pageable pageable = createPageable(page, size, sortBy, sortDir);
        Page<ContactResponse> contacts = contactService.getContactsByHelpScore(userId, helpScore, pageable);
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<ContactResponse>> getContactsWithFilters(
            @RequestParam(required = false) String company,
            @RequestParam(required = false) ContactType contactType,
            @RequestParam(required = false) ContactStatus status,
            @RequestParam(required = false) HelpScore helpScore,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get contacts with filters request received");

        Long userId = extractUserIdFromToken(authHeader);
        Pageable pageable = createPageable(page, size, sortBy, sortDir);
        Page<ContactResponse> contacts = contactService.getContactsWithFilters(
                userId, company, contactType, status, helpScore, pageable);
        return ResponseEntity.ok(contacts);
    }

    private Pageable createPageable(int page, int size, String sortBy, String sortDir) {
        if (page < 0) {
            throw new IllegalArgumentException("Page number must be zero or greater");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("Page size must be between 1 and 100");
        }
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new IllegalArgumentException("Unsupported sort field: " + sortBy);
        }

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(direction, sortBy));
    }

    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }

        String token = authHeader.substring(7);
        return jwtService.extractUserId(token);
    }
}
