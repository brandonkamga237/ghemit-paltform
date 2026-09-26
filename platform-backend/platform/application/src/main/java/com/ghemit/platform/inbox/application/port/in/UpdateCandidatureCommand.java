package com.ghemit.platform.inbox.application.port.in;

import com.ghemit.platform.inbox.domain.CandidatureId;
import com.ghemit.platform.inbox.domain.CandidatureStatus;

/**
 * Mise à jour partielle d'une candidature.
 *
 * @param noteProvided distingue « note absente de la requête » de « note vidée »
 */
public record UpdateCandidatureCommand(CandidatureId id, Boolean read, CandidatureStatus status,
		boolean noteProvided, String note) {
}
