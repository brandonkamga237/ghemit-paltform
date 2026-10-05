package com.ghemit.platform.content.infrastructure.in.web;

import com.ghemit.platform.content.application.port.in.PublicContentView;
import java.util.List;
import java.util.Map;

/** Contenu dynamique du site public (articles, formations, partenaires, statuts). */
public record PublicContentResponse(
		List<Map<String, Object>> programs,
		List<Map<String, Object>> formations,
		List<Map<String, Object>> articles,
		List<Map<String, Object>> events,
		List<Map<String, Object>> partners) {

	public static PublicContentResponse from(PublicContentView view) {
		return new PublicContentResponse(
				view.programs(), view.formations(), view.articles(), view.events(), view.partners());
	}
}
