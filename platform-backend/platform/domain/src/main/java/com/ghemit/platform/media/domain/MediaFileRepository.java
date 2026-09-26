package com.ghemit.platform.media.domain;

import java.util.List;
import java.util.Optional;

/** Port de persistance des métadonnées de la médiathèque. */
public interface MediaFileRepository {

	MediaFile save(MediaFile media);

	Optional<MediaFile> findById(MediaFileId id);

	Optional<MediaFile> findByObjectKey(ObjectKey objectKey);

	List<MediaFile> findAll();

	void delete(MediaFile media);
}
