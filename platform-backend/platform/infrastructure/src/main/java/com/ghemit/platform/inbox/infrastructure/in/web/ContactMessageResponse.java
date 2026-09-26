package com.ghemit.platform.inbox.infrastructure.in.web;

import com.ghemit.platform.inbox.domain.ContactMessage;
import java.time.Instant;
import java.util.UUID;

public record ContactMessageResponse(UUID id, String name, String email, String subject,
		String message, boolean readFlag, Instant createdAt) {

	public static ContactMessageResponse from(ContactMessage message) {
		return new ContactMessageResponse(message.id().value(), message.name().orElse(null),
				message.email().value(), message.subject().orElse(null), message.body(),
				message.isRead(), message.createdAt());
	}
}
