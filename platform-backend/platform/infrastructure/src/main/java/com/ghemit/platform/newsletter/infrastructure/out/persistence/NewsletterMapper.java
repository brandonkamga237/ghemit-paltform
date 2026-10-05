package com.ghemit.platform.newsletter.infrastructure.out.persistence;

import com.ghemit.platform.newsletter.domain.Campaign;
import com.ghemit.platform.newsletter.domain.CampaignId;
import com.ghemit.platform.newsletter.domain.Subscriber;
import com.ghemit.platform.newsletter.domain.SubscriberId;
import com.ghemit.platform.shared.domain.EmailAddress;

final class NewsletterMapper {

	private NewsletterMapper() {
	}

	static Subscriber toDomain(SubscriberJpaEntity entity) {
		return Subscriber.rehydrate(
				SubscriberId.of(entity.getId()),
				EmailAddress.of(entity.getEmail()),
				entity.getName(),
				entity.getSource(),
				entity.isActive(),
				entity.getCreatedAt());
	}

	static SubscriberJpaEntity toEntity(Subscriber subscriber) {
		SubscriberJpaEntity entity = new SubscriberJpaEntity();
		entity.setId(subscriber.id().value());
		entity.setEmail(subscriber.email().value());
		entity.setName(subscriber.name().orElse(null));
		entity.setSource(subscriber.source().orElse(null));
		entity.setActive(subscriber.isActive());
		entity.setCreatedAt(subscriber.createdAt());
		return entity;
	}

	static Campaign toDomain(CampaignJpaEntity entity) {
		return Campaign.rehydrate(
				CampaignId.of(entity.getId()),
				entity.getSubject(),
				entity.getBody(),
				Campaign.statusOrSent(entity.getStatus()),
				entity.getRecipientCount(),
				entity.getCreatedAt(),
				entity.getSentAt());
	}

	static CampaignJpaEntity toEntity(Campaign campaign) {
		CampaignJpaEntity entity = new CampaignJpaEntity();
		entity.setId(campaign.id().value());
		entity.setSubject(campaign.subject());
		entity.setBody(campaign.body());
		entity.setStatus(campaign.status().name());
		entity.setRecipientCount(campaign.recipientCount());
		entity.setCreatedAt(campaign.createdAt());
		entity.setSentAt(campaign.sentAt());
		return entity;
	}
}
