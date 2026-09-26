package com.ghemit.platform.inbox.domain;

import com.ghemit.platform.shared.domain.BusinessRuleViolationException;
import com.ghemit.platform.shared.domain.EmailAddress;
import java.time.Instant;
import java.util.Objects;
import java.util.Optional;

/** Agrégat racine : un message envoyé via le formulaire de contact. */
public final class ContactMessage {

	private final ContactMessageId id;
	private final String name;
	private final EmailAddress email;
	private final String subject;
	private final String body;
	private final Instant createdAt;
	private boolean read;

	private ContactMessage(ContactMessageId id, String name, EmailAddress email, String subject,
			String body, boolean read, Instant createdAt) {
		this.id = Objects.requireNonNull(id);
		this.name = blankToNull(name);
		this.email = Objects.requireNonNull(email, "L'adresse e-mail est obligatoire");
		this.subject = blankToNull(subject);
		this.body = requireBody(body);
		this.read = read;
		this.createdAt = Objects.requireNonNull(createdAt);
	}

	public static ContactMessage receive(String name, EmailAddress email, String subject, String body) {
		return new ContactMessage(ContactMessageId.newId(), name, email, subject, body, false, Instant.now());
	}

	public static ContactMessage rehydrate(ContactMessageId id, String name, EmailAddress email,
			String subject, String body, boolean read, Instant createdAt) {
		return new ContactMessage(id, name, email, subject, body, read, createdAt);
	}

	public void markAsRead() {
		this.read = true;
	}

	public void changeReadFlag(boolean read) {
		this.read = read;
	}

	private static String requireBody(String body) {
		if (body == null || body.isBlank()) {
			throw new BusinessRuleViolationException("Le message ne peut pas être vide");
		}
		return body.trim();
	}

	private static String blankToNull(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	public ContactMessageId id() {
		return id;
	}

	public Optional<String> name() {
		return Optional.ofNullable(name);
	}

	public EmailAddress email() {
		return email;
	}

	public Optional<String> subject() {
		return Optional.ofNullable(subject);
	}

	public String body() {
		return body;
	}

	public boolean isRead() {
		return read;
	}

	public Instant createdAt() {
		return createdAt;
	}
}
