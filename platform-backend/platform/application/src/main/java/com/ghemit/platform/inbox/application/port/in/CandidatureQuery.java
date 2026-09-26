package com.ghemit.platform.inbox.application.port.in;

import com.ghemit.platform.inbox.domain.Candidature;
import com.ghemit.platform.inbox.domain.CandidatureCriteria;
import com.ghemit.platform.shared.domain.Page;
import com.ghemit.platform.shared.domain.PageRequest;

/** Consultation des candidatures par le back office. */
public interface CandidatureQuery {

	Page<Candidature> search(CandidatureCriteria criteria, PageRequest pageRequest);

	CandidatureSummary summary();
}
