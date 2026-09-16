package com.ghemit.platform.inbox;

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
@Table(name = "contact_messages")
public class ContactMessage {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	private String name;

	@Column(nullable = false)
	private String email;

	private String subject;

	@Column(nullable = false, columnDefinition = "text")
	private String message;

	@Column(nullable = false)
	private boolean readFlag;

	@Column(nullable = false)
	private Instant createdAt = Instant.now();
}
