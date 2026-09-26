package com.ghemit.platform.inbox.infrastructure.out.persistence;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

interface ContactMessageJpaRepository extends JpaRepository<ContactMessageJpaEntity, UUID>,
		JpaSpecificationExecutor<ContactMessageJpaEntity> {
}
