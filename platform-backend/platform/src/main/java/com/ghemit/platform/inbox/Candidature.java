package com.ghemit.platform.inbox;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@Entity
@Table(name = "candidatures")
public class Candidature {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(nullable = false)
	private String program;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb", nullable = false)
	private Map<String, Object> form = new HashMap<>();

	@Column(nullable = false)
	private boolean readFlag;

	/** État de traitement : new, in_progress, accepted, rejected, archived. */
	@Column(columnDefinition = "varchar not null default 'new'")
	private String status = "new";

	/** Note interne de l'équipe (jamais exposée publiquement). */
	@Column(columnDefinition = "text")
	private String note;

	@Column(nullable = false)
	private Instant createdAt = Instant.now();
}
