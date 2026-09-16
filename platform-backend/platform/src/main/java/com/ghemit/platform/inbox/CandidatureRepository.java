package com.ghemit.platform.inbox;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidatureRepository extends JpaRepository<Candidature, UUID> {
}
