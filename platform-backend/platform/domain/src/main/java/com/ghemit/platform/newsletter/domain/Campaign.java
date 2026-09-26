package com.ghemit.platform.newsletter.domain;

import com.ghemit.platform.shared.domain.BusinessRuleViolationException;
import java.time.Instant;
import java.util.Objects;

/** Agrégat racine : la trace d'un envoi de newsletter et de sa portée. */
public final class Campaign {

	private final CampaignId id;
	private final String subject;
	private final String body;
	private final int recipientCount;
	private final Instant sentAt;

	private Campaign(CampaignId id, String subject, String body, int recipientCount, Instant sentAt) {
		this.id = Objects.requireNonNull(id);
		this.subject = requireText(subject, "L'objet de la campagne est obligatoire");
		this.body = requireText(body, "Le corps de la campagne est obligatoire");
		this.recipientCount = recipientCount;
		this.sentAt = Objects.requireNonNull(sentAt);
	}

	/** Une campagne n'existe qu'une fois envoyée : elle enregistre le nombre de destinataires servis. */
	public static Campaign sent(String subject, String body, int recipientCount) {
		return new Campaign(CampaignId.newId(), subject, body, recipientCount, Instant.now());
	}

	public static Campaign rehydrate(CampaignId id, String subject, String body, int recipientCount,
			Instant sentAt) {
		return new Campaign(id, subject, body, recipientCount, sentAt);
	}

	private static String requireText(String value, String message) {
		if (value == null || value.isBlank()) {
			throw new BusinessRuleViolationException(message);
		}
		return value;
	}

	public CampaignId id() {
		return id;
	}

	public String subject() {
		return subject;
	}

	public String body() {
		return body;
	}

	public int recipientCount() {
		return recipientCount;
	}

	public Instant sentAt() {
		return sentAt;
	}
}
