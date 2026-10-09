package com.ghemit.platform.content.infrastructure.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface ContentItemJpaRepository extends JpaRepository<ContentItemJpaEntity, UUID> {

	List<ContentItemJpaEntity> findByTypeOrderByPositionAsc(ContentTypeCode type);

	/** Le plus récent si des doublons historiques existent (le service les refuse désormais). */
	Optional<ContentItemJpaEntity> findFirstByTypeAndSlugOrderByUpdatedAtDesc(ContentTypeCode type, String slug);
}
