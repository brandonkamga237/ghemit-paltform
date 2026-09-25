package com.ghemit.platform.content;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Contenu public du site, aligné sur la forme de src/data/content.ts du frontend.
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicContentController {

	private final ContentItemRepository repository;

	@GetMapping("/content")
	public Map<String, Object> content() {
		Map<String, Object> out = new LinkedHashMap<>();
		out.put("programs", payloads(ContentType.PROGRAM));
		out.put("formations", payloads(ContentType.FORMATION));
		out.put("calendarRows", payloads(ContentType.CALENDAR_ROW));
		out.put("articles", payloads(ContentType.ARTICLE));
		out.put("blogCategories", setting("blog-categories").getOrDefault("items", List.of()));
		out.put("faq", payloads(ContentType.FAQ));
		out.put("partners", payloads(ContentType.PARTNER));
		out.put("stats", payloads(ContentType.STAT));
		out.put("achievements", payloads(ContentType.ACHIEVEMENT));
		out.put("contact", setting("contact"));
		out.put("pageTexts", setting("page-texts").getOrDefault("texts", Map.of()));
		return out;
	}

	private List<Map<String, Object>> payloads(ContentType type) {
		return repository.findByTypeOrderByPositionAsc(type).stream()
				.map(ContentItem::getPayload)
				.toList();
	}

	private Map<String, Object> setting(String slug) {
		return repository.findByTypeAndSlug(ContentType.SETTING, slug)
				.map(ContentItem::getPayload)
				.orElse(Map.of());
	}
}
