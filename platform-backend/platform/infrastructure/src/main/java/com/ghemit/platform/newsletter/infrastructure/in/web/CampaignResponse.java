package com.ghemit.platform.newsletter.infrastructure.in.web;

import com.ghemit.platform.newsletter.domain.Campaign;
import java.time.Instant;
import java.util.UUID;

public record CampaignResponse(UUID id, String subject, String body, int recipientCount, Instant sentAt) {

	public static CampaignResponse from(Campaign campaign) {
		return new CampaignResponse(campaign.id().value(), campaign.subject(), campaign.body(),
				campaign.recipientCount(), campaign.sentAt());
	}
}
