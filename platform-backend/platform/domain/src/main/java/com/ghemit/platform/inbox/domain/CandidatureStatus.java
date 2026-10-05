package com.ghemit.platform.inbox.domain;

import com.ghemit.platform.shared.domain.BusinessRuleViolationException;
import java.util.List;

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

	/**
	 * Transitions autorisées depuis cet état : le traitement avance (nouvelle →
	 * en cours → retenue/non retenue → archivée). On peut rouvrir un dossier
	 * non retenu ou archivé en le repassant « en cours ».
	 */
	public List<CandidatureStatus> allowedTransitions() {
		return switch (this) {
			case NEW -> List.of(IN_PROGRESS, ACCEPTED, REJECTED, ARCHIVED);
			case IN_PROGRESS -> List.of(ACCEPTED, REJECTED, ARCHIVED);
			case ACCEPTED -> List.of(ARCHIVED);
			case REJECTED -> List.of(IN_PROGRESS, ARCHIVED);
			case ARCHIVED -> List.of(IN_PROGRESS);
		};
	}

	public boolean canTransitionTo(CandidatureStatus next) {
		return allowedTransitions().contains(next);
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
