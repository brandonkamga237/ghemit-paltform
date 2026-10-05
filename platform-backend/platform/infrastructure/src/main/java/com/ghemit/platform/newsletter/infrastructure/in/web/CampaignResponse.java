package com.ghemit.platform.newsletter.infrastructure.in.web;

import com.ghemit.platform.newsletter.domain.Campaign;
import java.time.Instant;
import java.util.UUID;

public record CampaignResponse(UUID id, String subject, String body, String status,
		int recipientCount, java.util.List<String> audience, Instant createdAt, Instant sentAt) {

	public static CampaignResponse from(Campaign campaign) {
		return new CampaignResponse(campaign.id().value(), campaign.subject(), campaign.body(),
				campaign.status().name().toLowerCase(), campaign.recipientCount(),
				java.util.List.copyOf(campaign.audience()), campaign.createdAt(),
				campaign.sentAt());
	}
}
