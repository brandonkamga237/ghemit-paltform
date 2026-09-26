package com.ghemit.platform.media.infrastructure.out.persistence;

import com.ghemit.platform.media.domain.MediaFile;
import com.ghemit.platform.media.domain.MediaFileId;
import com.ghemit.platform.media.domain.MediaFileRepository;
import com.ghemit.platform.media.domain.ObjectKey;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class MediaFileRepositoryAdapter implements MediaFileRepository {

	private final MediaFileJpaRepository jpaRepository;

	@Override
	public MediaFile save(MediaFile media) {
		return MediaFileMapper.toDomain(jpaRepository.save(MediaFileMapper.toEntity(media)));
	}

	@Override
	public Optional<MediaFile> findById(MediaFileId id) {
		return jpaRepository.findById(id.value()).map(MediaFileMapper::toDomain);
	}

	@Override
	public Optional<MediaFile> findByObjectKey(ObjectKey objectKey) {
		return jpaRepository.findByObjectKey(objectKey.value()).map(MediaFileMapper::toDomain);
	}

	@Override
	public List<MediaFile> findAll() {
		return jpaRepository.findAll().stream().map(MediaFileMapper::toDomain).toList();
	}

	@Override
	public void delete(MediaFile media) {
		jpaRepository.deleteById(media.id().value());
	}
}
