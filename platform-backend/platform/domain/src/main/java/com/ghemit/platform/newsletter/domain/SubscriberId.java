package com.ghemit.platform.newsletter.domain;

import java.util.Objects;
import java.util.UUID;

public record SubscriberId(UUID value) {

	public SubscriberId {
		Objects.requireNonNull(value, "L'identifiant d'abonné est obligatoire");
	}

	public static SubscriberId newId() {
		return new SubscriberId(UUID.randomUUID());
	}

	public static SubscriberId of(UUID value) {
		return new SubscriberId(value);
	}

	@Override
	public String toString() {
		return value.toString();
	}
}
