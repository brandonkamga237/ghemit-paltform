package com.ghemit.platform.content.infrastructure.in.web;

import com.ghemit.platform.content.domain.ContentItem;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/** Forme exposée d'un contenu éditorial, telle que consommée par le back office. */
public record ContentItemResponse(UUID id, String type, String slug, int position,
		Map<String, Object> payload, Instant updatedAt) {

	public static ContentItemResponse from(ContentItem item) {
		return new ContentItemResponse(item.id().value(), item.type().path(), item.slug(),
				item.position(), item.payload().asMap(), item.updatedAt());
	}
}
