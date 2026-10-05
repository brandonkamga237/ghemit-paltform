package com.ghemit.platform.newsletter.domain;

import com.ghemit.platform.shared.domain.BusinessRuleViolationException;
import java.time.Instant;
import java.util.Objects;

/**
 * Agrégat racine : une campagne newsletter. Elle naît brouillon, passe par
 * « envoi en cours » puis « envoyée » (ou « échouée »). Seul un brouillon
 * peut être modifié, supprimé ou envoyé.
 */
public final class Campaign {

	public enum Status {
		DRAFT, SENDING, SENT, FAILED
	}

	private final CampaignId id;
	private String subject;
	private String body;
	private Status status;
	private int recipientCount;
	private final Instant createdAt;
	private Instant sentAt;

	private Campaign(CampaignId id, String subject, String body, Status status, int recipientCount,
			Instant createdAt, Instant sentAt) {
		this.id = Objects.requireNonNull(id);
		this.subject = requireText(subject, "L'objet de la campagne est obligatoire");
		this.body = requireText(body, "Le corps de la campagne est obligatoire");
		this.status = Objects.requireNonNull(status);
		this.recipientCount = recipientCount;
		this.createdAt = Objects.requireNonNull(createdAt);
		this.sentAt = sentAt;
	}

	public static Campaign draft(String subject, String body) {
		return new Campaign(CampaignId.newId(), subject, body, Status.DRAFT, 0, Instant.now(), null);
	}

	public static Campaign rehydrate(CampaignId id, String subject, String body, Status status,
			int recipientCount, Instant createdAt, Instant sentAt) {
		// Les campagnes antérieures aux brouillons n'ont pas de createdAt :
		// on retombe sur sentAt, toujours renseigné pour elles.
		Instant created = createdAt != null ? createdAt : sentAt;
		return new Campaign(id, subject, body, status, recipientCount,
				created != null ? created : Instant.now(), sentAt);
	}

	/** Les campagnes créées avant les brouillons n'ont pas de statut : elles étaient envoyées. */
	public static Status statusOrSent(String raw) {
		if (raw == null || raw.isBlank()) {
			return Status.SENT;
		}
		return Status.valueOf(raw);
	}

	public void edit(String subject, String body) {
		requireDraft();
		this.subject = requireText(subject, "L'objet de la campagne est obligatoire");
		this.body = requireText(body, "Le corps de la campagne est obligatoire");
	}

	public void markSending() {
		requireDraft();
		this.status = Status.SENDING;
	}

	public void markSent(int delivered) {
		this.status = Status.SENT;
		this.recipientCount = delivered;
		this.sentAt = Instant.now();
	}

	public void markFailed() {
		this.status = Status.FAILED;
		this.sentAt = Instant.now();
	}

	public boolean isDraft() {
		return status == Status.DRAFT;
	}

	private void requireDraft() {
		if (status != Status.DRAFT) {
			throw new BusinessRuleViolationException("Seul un brouillon peut être modifié ou envoyé");
		}
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

	public Status status() {
		return status;
	}

	public int recipientCount() {
		return recipientCount;
	}

	public Instant createdAt() {
		return createdAt;
	}

	public Instant sentAt() {
		return sentAt;
	}
}
