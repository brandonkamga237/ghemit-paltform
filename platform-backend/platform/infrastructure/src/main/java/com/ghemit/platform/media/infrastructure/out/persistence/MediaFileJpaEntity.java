package com.ghemit.platform.media.infrastructure.out.persistence;

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
@Table(name = "media_files")
public class MediaFileJpaEntity {

	@Id
	private UUID id;

	@Column(nullable = false, unique = true)
	private String objectKey;

	@Column(nullable = false)
	private String filename;

	private String contentType;

	/** Dossier logique de la médiathèque ; chaîne vide pour la racine. */
	@Column(columnDefinition = "varchar not null default ''")
	private String folder = "";

	private long size;

	@Column(nullable = false)
	private Instant createdAt = Instant.now();
}
