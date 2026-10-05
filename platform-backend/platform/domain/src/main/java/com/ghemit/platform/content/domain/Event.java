package com.ghemit.platform.content.domain;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Règles d'un événement (contenu de type {@link ContentType#EVENT}).
 * Payload : title, date (AAAA-MM-JJ), time, location, description,
 * status (scheduled|cancelled), registerUrl, imageUrl.
 */
public final class Event {

	public static final String STATUS_CANCELLED = "cancelled";

	private Event() {
	}

	public static boolean isCancelled(Payload payload) {
		return STATUS_CANCELLED.equals(payload.get("status"));
	}

	/** Date de l'événement ; null si absente ou illisible. */
	public static LocalDate date(Payload payload) {
		if (payload.get("date") instanceof String raw) {
			try {
				return LocalDate.parse(raw.length() > 10 ? raw.substring(0, 10) : raw);
			} catch (RuntimeException e) {
				return null;
			}
		}
		return null;
	}

	public static boolean isUpcoming(Payload payload, LocalDate today) {
		LocalDate date = date(payload);
		return date == null || !date.isBefore(today);
	}

	/**
	 * À venir d'abord (le plus proche en premier), puis passés (le plus récent
	 * en premier). Clé : jours avant/après aujourd'hui, inversés pour le passé.
	 */
	public static Comparator<ContentItem> calendar(LocalDate today) {
		return Comparator
				.comparingInt((ContentItem item) -> isUpcoming(item.payload(), today) ? 0 : 1)
				.thenComparingLong(item -> {
					LocalDate d = date(item.payload());
					if (d == null) return Long.MAX_VALUE;
					long days = ChronoUnit.DAYS.between(today, d);
					return days >= 0 ? days : -days;
				})
				.thenComparing(ContentItem::position);
	}

	/** Vue publique : ajoute "upcoming" et "cancelled", calculés par le domaine. */
	public static Map<String, Object> view(Payload payload, LocalDate today) {
		Map<String, Object> view = new LinkedHashMap<>(payload.asMap());
		view.put("upcoming", isUpcoming(payload, today));
		view.put("cancelled", isCancelled(payload));
		return view;
	}
}
