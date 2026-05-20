package com.jobflow.contacts.dto;

import com.jobflow.contacts.enums.ContactStatus;
import com.jobflow.contacts.enums.ContactType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactStatsResponse {

    private Long totalContacts;

    private Long referralCount;

    private Long recruiterCount;

    private Long hrCount;

    private Long hiringManagerCount;

    private Long mentorCount;

    private Long coldMailCount;

    private Long alumniCount;

    private Long friendCount;

    private Long notContactedCount;

    private Long messageSentCount;

    private Long respondedCount;

    private Long referralGivenCount;

    private Long highHelpScoreCount;

    private Long needsFollowupCount;
}
