package com.ghemit.platform.content.application;

import com.ghemit.platform.content.application.port.in.PublicContentQuery;
import com.ghemit.platform.content.application.port.in.PublicContentView;
import com.ghemit.platform.content.domain.ContentItem;
import com.ghemit.platform.content.domain.ContentItemRepository;
import com.ghemit.platform.content.domain.ContentType;
import com.ghemit.platform.content.domain.Payload;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Assemble le contenu dynamique du site public. */
public class PublicContentService implements PublicContentQuery {

	private final ContentItemRepository repository;

	public PublicContentService(ContentItemRepository repository) {
		this.repository = repository;
	}

	@Override
	public PublicContentView publicContent() {
		return new PublicContentView(
				repository.findByType(ContentType.PROGRAM).stream()
						.map(PublicContentService::programStatus)
						.toList(),
				payloads(ContentType.FORMATION),
				payloads(ContentType.ARTICLE),
				payloads(ContentType.PARTNER));
	}

	/** Seul le statut d'un programme est administrable : le reste de la fiche vit dans le code du site. */
	private static Map<String, Object> programStatus(ContentItem item) {
		Payload payload = item.payload();
		Map<String, Object> status = new LinkedHashMap<>();
		status.put("slug", item.slug());
		status.put("status", payload.getOrDefault("status", ""));
		status.put("statusLabel", payload.getOrDefault("statusLabel", ""));
		return status;
	}

	private List<Map<String, Object>> payloads(ContentType type) {
		return repository.findByType(type).stream()
				.map(ContentItem::payload)
				.map(Payload::asMap)
				.toList();
	}
}
