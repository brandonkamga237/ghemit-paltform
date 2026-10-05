package com.ghemit.platform.inbox.infrastructure.out.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

interface CandidatureJpaRepository extends JpaRepository<CandidatureJpaEntity, UUID>,
		JpaSpecificationExecutor<CandidatureJpaEntity> {

	@Query("select c.program, count(c) from CandidatureJpaEntity c group by c.program order by c.program")
	List<Object[]> countGroupedByProgram();

	@Query("select c.status, count(c) from CandidatureJpaEntity c group by c.status")
	List<Object[]> countGroupedByStatus();

	long countByReadFlagFalse();
}
