package com.ghemit.platform.newsletter.infrastructure.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface SubscriberJpaRepository extends JpaRepository<SubscriberJpaEntity, UUID> {

	Optional<SubscriberJpaEntity> findByEmailIgnoreCase(String email);

	List<SubscriberJpaEntity> findByActiveTrue();

	List<SubscriberJpaEntity> findAllByOrderByCreatedAtDesc();
}
