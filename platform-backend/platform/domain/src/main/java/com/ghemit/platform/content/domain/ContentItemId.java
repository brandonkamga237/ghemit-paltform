package com.ghemit.platform.content.domain;

import java.util.Objects;
import java.util.UUID;

public record ContentItemId(UUID value) {

	public ContentItemId {
		Objects.requireNonNull(value, "L'identifiant de contenu est obligatoire");
	}

	public static ContentItemId newId() {
		return new ContentItemId(UUID.randomUUID());
	}

	public static ContentItemId of(UUID value) {
		return new ContentItemId(value);
	}

	@Override
	public String toString() {
		return value.toString();
	}
}
