package com.ghemit.platform.media;

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
@Table(name = "media_files")
public class MediaFile {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(nullable = false, unique = true)
	private String objectKey;

	@Column(nullable = false)
	private String filename;

	private String contentType;

	/** Dossier logique de la médiathèque (ex. « articles », « partenaires »). Vide = racine. */
	@Column(columnDefinition = "varchar not null default ''")
	private String folder = "";

	private long size;

	@Column(nullable = false)
	private Instant createdAt = Instant.now();

	public String getUrl() {
		return "/api/public/media/" + objectKey;
	}
}
