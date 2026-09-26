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
@Table(name = "newsletter_subscribers")
public class SubscriberJpaEntity {

	@Id
	private UUID id;

	@Column(nullable = false, unique = true)
	private String email;

	private String name;

	private String source;

	@Column(nullable = false)
	private boolean active = true;

	@Column(nullable = false)
	private Instant createdAt = Instant.now();
}
