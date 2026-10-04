package com.ghemit.platform.content.application;

import com.ghemit.platform.content.application.port.in.PublicContentQuery;
import com.ghemit.platform.content.application.port.in.PublicContentView;
import com.ghemit.platform.content.domain.ContentItem;
import com.ghemit.platform.content.domain.ContentItemRepository;
import com.ghemit.platform.content.domain.ContentType;
import com.ghemit.platform.content.domain.Payload;
import java.util.List;
import java.util.Map;

/** Assemble le contenu du site public à partir des contenus et des réglages. */
public class PublicContentService implements PublicContentQuery {

	static final String BLOG_CATEGORIES_SLUG = "blog-categories";
	static final String CONTACT_SLUG = "contact";
	static final String PAGE_TEXTS_SLUG = "page-texts";
	static final String PAGE_IMAGES_SLUG = "page-images";

	private final ContentItemRepository repository;

	public PublicContentService(ContentItemRepository repository) {
		this.repository = repository;
	}

	@Override
	public PublicContentView publicContent() {
		return new PublicContentView(
				payloads(ContentType.PROGRAM),
				payloads(ContentType.FORMATION),
				payloads(ContentType.CALENDAR_ROW),
				payloads(ContentType.ARTICLE),
				setting(BLOG_CATEGORIES_SLUG).stringList("items"),
				payloads(ContentType.FAQ),
				payloads(ContentType.PARTNER),
				payloads(ContentType.STAT),
				payloads(ContentType.ACHIEVEMENT),
				setting(CONTACT_SLUG).asMap(),
				nestedMap(setting(PAGE_TEXTS_SLUG), "texts"),
				nestedMap(setting(PAGE_IMAGES_SLUG), "images"));
	}

	private List<Map<String, Object>> payloads(ContentType type) {
		return repository.findByType(type).stream()
				.map(ContentItem::payload)
				.map(Payload::asMap)
				.toList();
	}

	private Payload setting(String slug) {
		return repository.findByTypeAndSlug(ContentType.SETTING, slug)
				.map(ContentItem::payload)
				.orElseGet(Payload::empty);
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> nestedMap(Payload payload, String key) {
		return payload.get(key) instanceof Map<?, ?> nested
				? (Map<String, Object>) nested
				: Map.of();
	}
}
