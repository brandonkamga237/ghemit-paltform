package com.ghemit.platform.content.application.port.in;

import java.util.List;
import java.util.Map;

/**
 * Modèle de lecture consommé par le site public : le contenu déjà assemblé,
 * section par section.
 */
public record PublicContentView(
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
		Map<String, Object> pageTexts) {
}
