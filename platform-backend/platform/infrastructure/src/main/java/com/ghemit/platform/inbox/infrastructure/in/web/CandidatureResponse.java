package com.ghemit.platform.inbox.infrastructure.in.web;

import com.ghemit.platform.inbox.domain.Candidature;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record CandidatureResponse(UUID id, String program, Map<String, Object> form, boolean readFlag,
		String status, String note, Instant createdAt) {

	public static CandidatureResponse from(Candidature candidature) {
		return new CandidatureResponse(candidature.id().value(), candidature.program().value(),
				candidature.form().asMap(), candidature.isRead(), candidature.status().code(),
				candidature.note().orElse(null), candidature.createdAt());
	}
}
