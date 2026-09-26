package com.ghemit.platform.content.infrastructure.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Représentation relationnelle d'un contenu éditorial. */
@Getter
@Setter
@Entity
@Table(name = "content_items", indexes = @Index(name = "idx_content_type", columnList = "type"))
public class ContentItemJpaEntity {

	@Id
	private UUID id;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ContentTypeCode type;

	private String slug;

	@Column(nullable = false)
	private int position;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb", nullable = false)
	private Map<String, Object> payload = new HashMap<>();

	@Column(nullable = false)
	private Instant updatedAt = Instant.now();
}
