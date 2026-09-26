package com.ghemit.platform.inbox.domain;

import java.util.List;

/**
 * Critères de consultation des candidatures par le back office. Un champ absent
 * ({@code null} ou liste vide) signifie « sans filtre ».
 */
public record CandidatureCriteria(List<ProgramCode> programs, Boolean read,
		CandidatureStatus status, String search) {

	public CandidatureCriteria {
		programs = programs == null ? List.of() : List.copyOf(programs);
		search = search == null || search.isBlank() ? null : search.trim();
	}

	public static CandidatureCriteria none() {
		return new CandidatureCriteria(List.of(), null, null, null);
	}

	public boolean hasProgramFilter() {
		return !programs.isEmpty();
	}

	public boolean hasSearch() {
		return search != null;
	}
}
