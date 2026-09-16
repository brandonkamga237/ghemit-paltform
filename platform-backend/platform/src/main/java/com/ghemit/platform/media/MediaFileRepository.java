package com.ghemit.platform.media;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaFileRepository extends JpaRepository<MediaFile, UUID> {

	Optional<MediaFile> findByObjectKey(String objectKey);
}
