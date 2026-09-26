package com.ghemit.platform.inbox.domain;

import java.util.Objects;
import java.util.UUID;

public record CandidatureId(UUID value) {

	public CandidatureId {
		Objects.requireNonNull(value, "L'identifiant de candidature est obligatoire");
	}

	public static CandidatureId newId() {
		return new CandidatureId(UUID.randomUUID());
	}

	public static CandidatureId of(UUID value) {
		return new CandidatureId(value);
	}

	@Override
	public String toString() {
		return value.toString();
	}
}
