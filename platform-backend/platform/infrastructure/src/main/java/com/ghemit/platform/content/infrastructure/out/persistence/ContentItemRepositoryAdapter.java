package com.ghemit.platform.content.infrastructure.out.persistence;

import com.ghemit.platform.content.domain.ContentItem;
import com.ghemit.platform.content.domain.ContentItemId;
import com.ghemit.platform.content.domain.ContentItemRepository;
import com.ghemit.platform.content.domain.ContentType;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

/** Implémentation JPA du port {@link ContentItemRepository}. */
@Repository
@RequiredArgsConstructor
public class ContentItemRepositoryAdapter implements ContentItemRepository {

	private final ContentItemJpaRepository jpaRepository;

	@Override
	public List<ContentItem> findByType(ContentType type) {
		return jpaRepository.findByTypeOrderByPositionAsc(ContentTypeCode.of(type)).stream()
				.map(ContentItemMapper::toDomain)
				.toList();
	}

	@Override
	public Optional<ContentItem> findByTypeAndSlug(ContentType type, String slug) {
		return jpaRepository.findFirstByTypeAndSlugOrderByUpdatedAtDesc(ContentTypeCode.of(type), slug)
				.map(ContentItemMapper::toDomain);
	}

	@Override
	public Optional<ContentItem> findById(ContentItemId id) {
		return jpaRepository.findById(id.value()).map(ContentItemMapper::toDomain);
	}

	@Override
	public ContentItem save(ContentItem item) {
		return ContentItemMapper.toDomain(jpaRepository.save(ContentItemMapper.toEntity(item)));
	}

	@Override
	public void delete(ContentItem item) {
		jpaRepository.deleteById(item.id().value());
	}

	@Override
	public long count() {
		return jpaRepository.count();
	}
}
