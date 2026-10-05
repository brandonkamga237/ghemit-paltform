package com.ghemit.platform.content.application.port.in;

import java.util.List;
import java.util.Map;

/**
 * Modèle de lecture consommé par le site public : uniquement le contenu réellement
 * administrable. Le contenu institutionnel vit dans le code du site.
 */
public record PublicContentView(
		List<Map<String, Object>> programs,
		List<Map<String, Object>> formations,
		List<Map<String, Object>> articles,
		List<Map<String, Object>> events,
		List<Map<String, Object>> partners) {
}
