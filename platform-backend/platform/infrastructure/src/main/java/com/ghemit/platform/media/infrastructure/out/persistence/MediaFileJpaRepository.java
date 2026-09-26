package com.ghemit.platform.media.infrastructure.out.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface MediaFileJpaRepository extends JpaRepository<MediaFileJpaEntity, UUID> {

	Optional<MediaFileJpaEntity> findByObjectKey(String objectKey);
}
