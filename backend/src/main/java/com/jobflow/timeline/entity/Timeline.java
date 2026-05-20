package com.jobflow.timeline.entity;

import com.jobflow.applications.entity.Application;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "timeline", indexes = {
    @Index(name = "idx_timeline_application_id", columnList = "application_id"),
    @Index(name = "idx_timeline_event_date", columnList = "event_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Timeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Column(nullable = false, length = 150)
    private String event;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
