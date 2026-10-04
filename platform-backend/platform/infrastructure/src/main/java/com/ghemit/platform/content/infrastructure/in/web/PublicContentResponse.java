package com.ghemit.platform.content.infrastructure.in.web;

import com.ghemit.platform.content.application.port.in.PublicContentView;
import java.util.List;
import java.util.Map;

/** Contenu du site public, aligné sur la forme de src/data/content.ts du frontend. */
public record PublicContentResponse(
		List<Map<String, Object>> programs,
		List<Map<String, Object>> formations,
		List<Map<String, Object>> calendarRows,
		List<Map<String, Object>> articles,
		List<String> blogCategories,
		List<Map<String, Object>> faq,
		List<Map<String, Object>> partners,
		List<Map<String, Object>> stats,
		List<Map<String, Object>> achievements,
		Map<String, Object> contact,
		Map<String, Object> pageTexts,
		Map<String, Object> pageImages) {

	public static PublicContentResponse from(PublicContentView view) {
		return new PublicContentResponse(view.programs(), view.formations(), view.calendarRows(),
				view.articles(), view.blogCategories(), view.faq(), view.partners(), view.stats(),
				view.achievements(), view.contact(), view.pageTexts(), view.pageImages());
	}
}
