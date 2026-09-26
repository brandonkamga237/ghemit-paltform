package com.ghemit.platform.newsletter.infrastructure.out.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface CampaignJpaRepository extends JpaRepository<CampaignJpaEntity, UUID> {

	List<CampaignJpaEntity> findAllByOrderBySentAtDesc();
}
