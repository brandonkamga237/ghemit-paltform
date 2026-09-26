package com.ghemit.platform.newsletter.infrastructure.in.web;

import com.ghemit.platform.newsletter.domain.Subscriber;
import java.time.Instant;
import java.util.UUID;

public record SubscriberResponse(UUID id, String email, String name, String source, boolean active,
		Instant createdAt) {

	public static SubscriberResponse from(Subscriber subscriber) {
		return new SubscriberResponse(subscriber.id().value(), subscriber.email().value(),
				subscriber.name().orElse(null), subscriber.source().orElse(null), subscriber.isActive(),
				subscriber.createdAt());
	}
}
