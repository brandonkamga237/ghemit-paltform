package com.ghemit.platform.newsletter.infrastructure.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface SubscriberJpaRepository extends JpaRepository<SubscriberJpaEntity, UUID> {

	Optional<SubscriberJpaEntity> findByEmailIgnoreCase(String email);

	List<SubscriberJpaEntity> findByActiveTrue();

	List<SubscriberJpaEntity> findAllByOrderByCreatedAtDesc();

	@Query(value = "select created_at::date as day, count(*) from newsletter_subscribers "
			+ "where created_at >= :since group by 1", nativeQuery = true)
	List<Object[]> countDailySince(java.time.LocalDate since);
}
