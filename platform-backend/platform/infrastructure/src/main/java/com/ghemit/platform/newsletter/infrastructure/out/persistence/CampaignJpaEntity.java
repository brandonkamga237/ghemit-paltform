package com.ghemit.platform.newsletter.infrastructure.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "newsletter_campaigns")
public class CampaignJpaEntity {

	@Id
	private UUID id;

	@Column(nullable = false)
	private String subject;

	@Column(nullable = false, columnDefinition = "text")
	private String body;

	/** DRAFT, SENDING, SENT, FAILED — null sur les lignes antérieures = SENT. */
	@Column
	private String status;

	@Column(nullable = false)
	private int recipientCount;

	/** Origines ciblées, séparées par des virgules ; vide = tous les actifs. */
	@Column
	private String audience = "";

	@Column(nullable = false)
	private Instant createdAt = Instant.now();

	/** Null tant que la campagne n'est pas partie. */
	@Column
	private Instant sentAt;
}
