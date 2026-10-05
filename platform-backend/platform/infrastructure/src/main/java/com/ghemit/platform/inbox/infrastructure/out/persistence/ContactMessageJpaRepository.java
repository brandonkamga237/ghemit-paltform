package com.ghemit.platform.inbox.infrastructure.out.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

interface ContactMessageJpaRepository extends JpaRepository<ContactMessageJpaEntity, UUID>,
		JpaSpecificationExecutor<ContactMessageJpaEntity> {

	@Query(value = "select created_at::date as day, count(*) from contact_messages "
			+ "where created_at >= :since group by 1", nativeQuery = true)
	List<Object[]> countDailySince(java.time.LocalDate since);
}
