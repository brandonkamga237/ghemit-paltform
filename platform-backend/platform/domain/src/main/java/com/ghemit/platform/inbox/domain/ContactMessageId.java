package com.ghemit.platform.inbox.domain;

import java.util.Objects;
import java.util.UUID;

public record ContactMessageId(UUID value) {

	public ContactMessageId {
		Objects.requireNonNull(value, "L'identifiant de message est obligatoire");
	}

	public static ContactMessageId newId() {
		return new ContactMessageId(UUID.randomUUID());
	}

	public static ContactMessageId of(UUID value) {
		return new ContactMessageId(value);
	}

	@Override
	public String toString() {
		return value.toString();
	}
}
