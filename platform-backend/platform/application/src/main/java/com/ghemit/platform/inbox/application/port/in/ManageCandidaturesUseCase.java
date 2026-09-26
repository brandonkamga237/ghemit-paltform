package com.ghemit.platform.inbox.application.port.in;

import com.ghemit.platform.inbox.domain.Candidature;
import com.ghemit.platform.inbox.domain.CandidatureId;

/** Traitement des candidatures par l'équipe. */
public interface ManageCandidaturesUseCase {

	Candidature markAsRead(CandidatureId id);

	Candidature update(UpdateCandidatureCommand command);

	void delete(CandidatureId id);
}
