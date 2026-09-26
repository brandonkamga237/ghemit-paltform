package com.ghemit.platform.media.domain;

import java.util.Objects;
import java.util.UUID;

public record MediaFileId(UUID value) {

	public MediaFileId {
		Objects.requireNonNull(value, "L'identifiant de média est obligatoire");
	}

	public static MediaFileId newId() {
		return new MediaFileId(UUID.randomUUID());
	}

	public static MediaFileId of(UUID value) {
		return new MediaFileId(value);
	}

	@Override
	public String toString() {
		return value.toString();
	}
}
