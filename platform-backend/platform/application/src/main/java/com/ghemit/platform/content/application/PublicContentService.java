package com.ghemit.platform.content.application;

import com.ghemit.platform.content.application.port.in.PublicContentQuery;
import com.ghemit.platform.content.application.port.in.PublicContentView;
import com.ghemit.platform.content.domain.Article;
import com.ghemit.platform.content.domain.ContentItem;
import com.ghemit.platform.content.domain.ContentItemRepository;
import com.ghemit.platform.content.domain.ContentType;
import com.ghemit.platform.content.domain.Event;
import com.ghemit.platform.content.domain.Payload;
import com.ghemit.platform.shared.domain.EntityNotFoundException;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Assemble le contenu dynamique du site public. Les brouillons n'y figurent jamais. */
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
				repository.findByType(ContentType.ARTICLE).stream()
						.filter(item -> Article.isPublished(item.payload()))
						.sorted(Article.NEWEST_FIRST)
						.map(item -> Article.summary(item.payload()))
						.toList(),
				events(),
				payloads(ContentType.PARTNER));
	}

	@Override
	public Map<String, Object> publishedArticle(String slug) {
		return repository.findByTypeAndSlug(ContentType.ARTICLE, slug)
				.map(ContentItem::payload)
				.filter(Article::isPublished)
				.map(Article::full)
				.orElseThrow(() -> new EntityNotFoundException("Article introuvable"));
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

	/** Événements triés pour l'agenda : à venir d'abord, puis passés récents. */
	private List<Map<String, Object>> events() {
		LocalDate today = LocalDate.now();
		return repository.findByType(ContentType.EVENT).stream()
				.sorted(Event.calendar(today))
				.map(item -> Event.view(item.payload(), today))
				.toList();
	}

	private List<Map<String, Object>> payloads(ContentType type) {
		return repository.findByType(type).stream()
				.map(ContentItem::payload)
				.map(Payload::asMap)
				.toList();
	}
}
