package com.ghemit.platform.content.domain;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Corps libre d'un contenu (JSON). Objet valeur immuable : l'ordre des clés est
 * conservé car il détermine l'ordre des champs renvoyés au site public.
 */
public final class Payload {

	private static final Payload EMPTY = new Payload(Map.of());

	private final Map<String, Object> values;

	private Payload(Map<String, Object> values) {
		this.values = Collections.unmodifiableMap(new LinkedHashMap<>(values));
	}

	public static Payload empty() {
		return EMPTY;
	}

	public static Payload of(Map<String, Object> values) {
		return values == null || values.isEmpty() ? EMPTY : new Payload(values);
	}

	public Map<String, Object> asMap() {
		return values;
	}

	public Object get(String key) {
		return values.get(key);
	}

	public Object getOrDefault(String key, Object fallback) {
		return values.getOrDefault(key, fallback);
	}

	/** Lecture typée des réglages qui stockent une liste de libellés (dossiers média, catégories…). */
	public List<String> stringList(String key) {
		if (values.get(key) instanceof List<?> raw) {
			return raw.stream().map(String::valueOf).toList();
		}
		return List.of();
	}

	public Payload with(String key, Object value) {
		Map<String, Object> copy = new LinkedHashMap<>(values);
		copy.put(key, value);
		return new Payload(copy);
	}

	public boolean isEmpty() {
		return values.isEmpty();
	}

	@Override
	public boolean equals(Object other) {
		return other instanceof Payload payload && values.equals(payload.values);
	}

	@Override
	public int hashCode() {
		return values.hashCode();
	}
}
