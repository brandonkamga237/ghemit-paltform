package com.ghemit.platform.content.domain;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Règles éditoriales d'un article de blog (contenu de type {@link ContentType#ARTICLE}).
 * Le corps est une liste de blocs typés stockée telle quelle dans le payload.
 */
public final class Article {

	public static final String STATUS_DRAFT = "draft";
	public static final String STATUS_PUBLISHED = "published";

	/** Vitesse de lecture moyenne retenue pour estimer la durée. */
	static final int WORDS_PER_MINUTE = 220;

	/** Champs du corps qui ne servent qu'à la page article, pas aux listes. */
	private static final List<String> FULL_ONLY_FIELDS = List.of("body", "cta");

	/** Ordre d'affichage : publication la plus récente d'abord, puis ordre manuel. */
	public static final Comparator<ContentItem> NEWEST_FIRST = Comparator
			.comparing((ContentItem item) -> String.valueOf(item.payload().getOrDefault("publishedAt", "")))
			.reversed()
			.thenComparing(ContentItem::position);

	private Article() {
	}

	/** Un article sans statut (contenu antérieur à l'introduction des brouillons) est publié. */
	public static boolean isPublished(Payload payload) {
		return !STATUS_DRAFT.equals(payload.get("status"));
	}

	/** Durée de lecture estimée en minutes (au moins 1), calculée sur le texte des blocs. */
	public static int readingMinutes(Payload payload) {
		long words = 0;
		if (payload.get("body") instanceof List<?> blocks) {
			for (Object block : blocks) {
				if (block instanceof Map<?, ?> map && map.get("text") instanceof String text) {
					words += text.isBlank() ? 0 : text.trim().split("\\s+").length;
				}
			}
		}
		return (int) Math.max(1, Math.round((double) words / WORDS_PER_MINUTE));
	}

	/** Version complète, telle que lue sur la page de l'article. */
	public static Map<String, Object> full(Payload payload) {
		Map<String, Object> view = new LinkedHashMap<>(payload.asMap());
		view.put("readingMinutes", readingMinutes(payload));
		return view;
	}

	/** Version allégée pour les listes : sans le corps, que seule la page article charge. */
	public static Map<String, Object> summary(Payload payload) {
		Map<String, Object> view = full(payload);
		FULL_ONLY_FIELDS.forEach(view::remove);
		return view;
	}
}
