package com.ghemit.platform.inbox.domain;

import com.ghemit.platform.shared.domain.Page;
import com.ghemit.platform.shared.domain.PageRequest;
import java.util.Map;
import java.util.Optional;

/** Port de persistance des candidatures. */
public interface CandidatureRepository {

	Candidature save(Candidature candidature);

	Optional<Candidature> findById(CandidatureId id);

	void delete(Candidature candidature);

	Page<Candidature> search(CandidatureCriteria criteria, PageRequest pageRequest);

	/** Nombre de candidatures par code de programme. */
	Map<String, Long> countByProgram();

	/** Nombre de candidatures par code de statut. */
	Map<String, Long> countByStatus();

	long countUnread();
}
