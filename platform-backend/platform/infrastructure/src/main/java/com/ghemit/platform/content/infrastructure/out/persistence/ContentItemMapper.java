package com.ghemit.platform.content.infrastructure.out.persistence;

import com.ghemit.platform.content.domain.ContentItem;
import com.ghemit.platform.content.domain.ContentItemId;
import com.ghemit.platform.content.domain.Payload;
import java.util.LinkedHashMap;

final class ContentItemMapper {

	private ContentItemMapper() {
	}

	static ContentItem toDomain(ContentItemJpaEntity entity) {
		return ContentItem.rehydrate(
				ContentItemId.of(entity.getId()),
				entity.getType().toDomain(),
				entity.getSlug(),
				entity.getPosition(),
				Payload.of(entity.getPayload()),
				entity.getUpdatedAt());
	}

	static ContentItemJpaEntity toEntity(ContentItem item) {
		ContentItemJpaEntity entity = new ContentItemJpaEntity();
		entity.setId(item.id().value());
		entity.setType(ContentTypeCode.of(item.type()));
		entity.setSlug(item.slug());
		entity.setPosition(item.position());
		entity.setPayload(new LinkedHashMap<>(item.payload().asMap()));
		entity.setUpdatedAt(item.updatedAt());
		return entity;
	}
}
