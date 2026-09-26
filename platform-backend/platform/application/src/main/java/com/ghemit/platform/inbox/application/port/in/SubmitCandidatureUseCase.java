package com.ghemit.platform.inbox.application.port.in;

import com.ghemit.platform.inbox.domain.Candidature;

/** Dépôt d'une candidature depuis le site public. */
public interface SubmitCandidatureUseCase {

	Candidature submit(SubmitCandidatureCommand command);
}
