package com.jobflow.contacts.service;

import com.jobflow.auth.entity.User;
import com.jobflow.auth.service.AuthService;
import com.jobflow.contacts.dto.ContactResponse;
import com.jobflow.contacts.dto.CreateContactRequest;
import com.jobflow.contacts.dto.UpdateContactRequest;
import com.jobflow.contacts.entity.Contact;
import com.jobflow.contacts.enums.ContactStatus;
import com.jobflow.contacts.enums.ContactType;
import com.jobflow.contacts.enums.HelpScore;
import com.jobflow.contacts.exception.ContactNotFoundException;
import com.jobflow.contacts.mapper.ContactMapper;
import com.jobflow.contacts.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ContactService {

    private final ContactRepository contactRepository;
    private final ContactMapper contactMapper;
    private final AuthService authService;

    public ContactResponse createContact(CreateContactRequest request, Long userId) {
        log.info("Creating contact for user: {}", userId);

        User user = authService.getUserById(userId);
        Contact contact = contactMapper.toEntity(request, user);
        Contact savedContact = contactRepository.save(contact);

        log.info("Contact created with id: {} for user: {}", savedContact.getId(), userId);
        return contactMapper.toResponse(savedContact);
    }

    @Transactional(readOnly = true)
    public Page<ContactResponse> getAllContacts(Long userId, Pageable pageable) {
        log.info("Fetching contacts for user: {}", userId);
        return contactRepository.findByUser_Id(userId, pageable)
                .map(contactMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ContactResponse getContactById(Long id, Long userId) {
        log.info("Fetching contact: {} for user: {}", id, userId);
        return contactRepository.findByIdAndUser_Id(id, userId)
                .map(contactMapper::toResponse)
                .orElseThrow(() -> new ContactNotFoundException("Contact not found with id: " + id));
    }

    public ContactResponse updateContact(Long id, UpdateContactRequest request, Long userId) {
        log.info("Updating contact: {} for user: {}", id, userId);

        Contact contact = findContactForUser(id, userId);
        contactMapper.updateEntity(request, contact);
        Contact updatedContact = contactRepository.save(contact);

        log.info("Contact updated: {} for user: {}", id, userId);
        return contactMapper.toResponse(updatedContact);
    }

    public ContactResponse updateContactStatus(Long id, ContactStatus status, Long userId) {
        log.info("Updating contact status: {} to {} for user: {}", id, status, userId);

        Contact contact = findContactForUser(id, userId);
        contact.setStatus(status);
        Contact updatedContact = contactRepository.save(contact);

        return contactMapper.toResponse(updatedContact);
    }

    public void deleteContact(Long id, Long userId) {
        log.info("Deleting contact: {} for user: {}", id, userId);

        Contact contact = findContactForUser(id, userId);
        contactRepository.delete(contact);

        log.info("Contact deleted: {} for user: {}", id, userId);
    }

    @Transactional(readOnly = true)
    public Page<ContactResponse> getContactsByCompany(Long userId, String company, Pageable pageable) {
        log.info("Fetching contacts for company: {} and user: {}", company, userId);
        return contactRepository.findByUser_IdAndCompanyContainingIgnoreCase(userId, company, pageable)
                .map(contactMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ContactResponse> getContactsByContactType(Long userId, ContactType contactType, Pageable pageable) {
        log.info("Fetching contacts by type: {} for user: {}", contactType, userId);
        return contactRepository.findByUser_IdAndContactType(userId, contactType, pageable)
                .map(contactMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ContactResponse> getContactsByStatus(Long userId, ContactStatus status, Pageable pageable) {
        log.info("Fetching contacts by status: {} for user: {}", status, userId);
        return contactRepository.findByUser_IdAndStatus(userId, status, pageable)
                .map(contactMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ContactResponse> getContactsByHelpScore(Long userId, HelpScore helpScore, Pageable pageable) {
        log.info("Fetching contacts by help score: {} for user: {}", helpScore, userId);
        return contactRepository.findByUser_IdAndHelpScore(userId, helpScore, pageable)
                .map(contactMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ContactResponse> getContactsWithFilters(
            Long userId,
            String company,
            ContactType contactType,
            ContactStatus status,
            HelpScore helpScore,
            Pageable pageable) {
        log.info("Fetching contacts with filters for user: {}", userId);
        return contactRepository.findByUserIdWithFilters(userId, company, contactType, status, helpScore, pageable)
                .map(contactMapper::toResponse);
    }

    private Contact findContactForUser(Long id, Long userId) {
        return contactRepository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ContactNotFoundException("Contact not found with id: " + id));
    }
}
