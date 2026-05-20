package com.jobflow.contacts.entity;

import com.jobflow.auth.entity.User;
import com.jobflow.contacts.enums.ContactStatus;
import com.jobflow.contacts.enums.ContactType;
import com.jobflow.contacts.enums.HelpScore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contacts", indexes = {
    @Index(name = "idx_contacts_user_id", columnList = "user_id"),
    @Index(name = "idx_contacts_contact_type", columnList = "contact_type"),
    @Index(name = "idx_contacts_status", columnList = "status"),
    @Index(name = "idx_contacts_help_score", columnList = "help_score"),
    @Index(name = "idx_contacts_company", columnList = "company"),
    @Index(name = "idx_contacts_email", columnList = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 150)
    private String company;

    @Column(length = 150)
    private String role;

    @Column(length = 100)
    private String level;

    @Column(name = "linkedin_url", length = 500)
    private String linkedinUrl;

    @Column(length = 255)
    private String email;

    @Column(length = 30)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "contact_type", nullable = false, length = 50)
    private ContactType contactType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private ContactStatus status = ContactStatus.NOT_CONTACTED;

    @Enumerated(EnumType.STRING)
    @Column(name = "help_score", length = 50)
    private HelpScore helpScore;

    @Column(length = 150)
    private String source;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "last_contact_date")
    private LocalDate lastContactDate;

    @Column(name = "next_followup_date")
    private LocalDate nextFollowupDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
