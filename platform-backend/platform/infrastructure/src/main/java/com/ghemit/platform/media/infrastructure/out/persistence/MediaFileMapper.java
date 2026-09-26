package com.ghemit.platform.media.infrastructure.out.persistence;

import com.ghemit.platform.media.domain.MediaFile;
import com.ghemit.platform.media.domain.MediaFileId;
import com.ghemit.platform.media.domain.MediaFolder;
import com.ghemit.platform.media.domain.ObjectKey;

final class MediaFileMapper {

	private MediaFileMapper() {
	}

	static MediaFile toDomain(MediaFileJpaEntity entity) {
		return MediaFile.rehydrate(
				MediaFileId.of(entity.getId()),
				ObjectKey.of(entity.getObjectKey()),
				entity.getFilename(),
				entity.getContentType(),
				MediaFolder.of(entity.getFolder()),
				entity.getSize(),
				entity.getCreatedAt());
	}

	static MediaFileJpaEntity toEntity(MediaFile media) {
		MediaFileJpaEntity entity = new MediaFileJpaEntity();
		entity.setId(media.id().value());
		entity.setObjectKey(media.objectKey().value());
		entity.setFilename(media.filename());
		entity.setContentType(media.contentType());
		entity.setFolder(media.folder().name());
		entity.setSize(media.size());
		entity.setCreatedAt(media.createdAt());
		return entity;
	}
}
