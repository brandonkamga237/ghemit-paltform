package com.ghemit.platform.media.domain;

import com.ghemit.platform.shared.domain.BusinessRuleViolationException;
import java.time.Instant;
import java.util.Objects;

/** Agrégat racine : un fichier de la médiathèque et son emplacement de stockage. */
public final class MediaFile {

	private final MediaFileId id;
	private final ObjectKey objectKey;
	private final String filename;
	private final String contentType;
	private final long size;
	private final Instant createdAt;
	private MediaFolder folder;

	private MediaFile(MediaFileId id, ObjectKey objectKey, String filename, String contentType,
			MediaFolder folder, long size, Instant createdAt) {
		this.id = Objects.requireNonNull(id);
		this.objectKey = Objects.requireNonNull(objectKey);
		this.filename = requireFilename(filename);
		this.contentType = contentType;
		this.folder = folder == null ? MediaFolder.root() : folder;
		this.size = size;
		this.createdAt = Objects.requireNonNull(createdAt);
	}

	public static MediaFile register(ObjectKey objectKey, String filename, String contentType,
			MediaFolder folder, long size) {
		return new MediaFile(MediaFileId.newId(), objectKey, filename, contentType, folder, size, Instant.now());
	}

	public static MediaFile rehydrate(MediaFileId id, ObjectKey objectKey, String filename,
			String contentType, MediaFolder folder, long size, Instant createdAt) {
		return new MediaFile(id, objectKey, filename, contentType, folder, size, createdAt);
	}

	/** Appelé quand le dossier qui contenait le fichier est supprimé. */
	public void moveToRoot() {
		this.folder = MediaFolder.root();
	}

	public boolean isIn(MediaFolder folder) {
		return this.folder.equals(folder);
	}

	private static String requireFilename(String filename) {
		if (filename == null || filename.isBlank()) {
			throw new BusinessRuleViolationException("Le nom du fichier est obligatoire");
		}
		return filename.trim();
	}

	public MediaFileId id() {
		return id;
	}

	public ObjectKey objectKey() {
		return objectKey;
	}

	public String filename() {
		return filename;
	}

	public String contentType() {
		return contentType;
	}

	public MediaFolder folder() {
		return folder;
	}

	public long size() {
		return size;
	}

	public Instant createdAt() {
		return createdAt;
	}
}
