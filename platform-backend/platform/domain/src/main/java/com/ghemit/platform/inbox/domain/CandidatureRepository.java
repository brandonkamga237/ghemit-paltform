package com.ghemit.platform.inbox.domain;

import com.ghemit.platform.shared.domain.Page;
import com.ghemit.platform.shared.domain.PageRequest;
import java.util.List;
import java.util.Optional;

/** Port de persistance des candidatures. */
public interface CandidatureRepository {

	Candidature save(Candidature candidature);

	Optional<Candidature> findById(CandidatureId id);

	void delete(Candidature candidature);

	Page<Candidature> search(CandidatureCriteria criteria, PageRequest pageRequest);

	List<Candidature> findAll();
}
