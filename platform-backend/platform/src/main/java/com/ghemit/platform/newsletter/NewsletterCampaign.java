package com.ghemit.platform.newsletter;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
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
public class NewsletterCampaign {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(nullable = false)
	private String subject;

	@Column(nullable = false, columnDefinition = "text")
	private String body;

	@Column(nullable = false)
	private int recipientCount;

	@Column(nullable = false)
	private Instant sentAt = Instant.now();
}
