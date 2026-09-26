package com.ghemit.platform.inbox.domain;

import com.ghemit.platform.shared.domain.BusinessRuleViolationException;

/** Cycle de vie du traitement d'une candidature par l'équipe. */
public enum CandidatureStatus {
	NEW("new"),
	IN_PROGRESS("in_progress"),
	ACCEPTED("accepted"),
	REJECTED("rejected"),
	ARCHIVED("archived");

	private final String code;

	CandidatureStatus(String code) {
		this.code = code;
	}

	public String code() {
		return code;
	}

	public static CandidatureStatus fromCode(String code) {
		for (CandidatureStatus status : values()) {
			if (status.code.equalsIgnoreCase(code)) {
				return status;
			}
		}
		throw new BusinessRuleViolationException("Statut de candidature inconnu : " + code);
	}

	/** Tolérant pour la reconstitution : les lignes historiques sans statut valent NEW. */
	public static CandidatureStatus fromStoredCode(String code) {
		if (code == null || code.isBlank()) {
			return NEW;
		}
		return fromCode(code);
	}
}
