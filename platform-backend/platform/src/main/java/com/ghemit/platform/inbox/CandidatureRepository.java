package com.ghemit.platform.inbox;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CandidatureRepository
		extends JpaRepository<Candidature, UUID>, JpaSpecificationExecutor<Candidature> {
}
