package com.ghemit.platform.inbox.infrastructure.in.web;

import com.ghemit.platform.inbox.domain.Candidature;
import com.ghemit.platform.inbox.domain.CandidatureStatus;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record CandidatureResponse(UUID id, String program, Map<String, Object> form, boolean readFlag,
		String status, List<String> allowedStatuses, String note, Instant createdAt) {

	public static CandidatureResponse from(Candidature candidature) {
		return new CandidatureResponse(candidature.id().value(), candidature.program().value(),
				candidature.form().asMap(), candidature.isRead(), candidature.status().code(),
				candidature.status().allowedTransitions().stream().map(CandidatureStatus::code).toList(),
				candidature.note().orElse(null), candidature.createdAt());
	}
}
