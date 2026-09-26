package com.ghemit.platform.media.domain;

import com.ghemit.platform.shared.domain.BusinessRuleViolationException;
import java.util.UUID;

/**
 * Clé d'un objet dans le stockage. Le domaine impose la forme des clés : un
 * préfixe aléatoire garantit l'unicité, et le nom d'origine est assaini.
 */
public record ObjectKey(String value) {

	private static final String CV_PREFIX = "cv/";

	public ObjectKey {
		if (value == null || value.isBlank()) {
			throw new BusinessRuleViolationException("La clé de stockage est obligatoire");
		}
		value = value.trim();
	}

	public static ObjectKey of(String value) {
		return new ObjectKey(value);
	}

	/** Clé d'un média de la médiathèque. */
	public static ObjectKey forLibrary(String filename) {
		return new ObjectKey(UUID.randomUUID() + "-" + sanitize(filename));
	}

	/** Clé d'un CV de candidature, isolée dans son propre préfixe. */
	public static ObjectKey forCv(String filename) {
		return new ObjectKey(CV_PREFIX + UUID.randomUUID() + "-" + sanitize(filename));
	}

	public boolean isCv() {
		return value.startsWith(CV_PREFIX);
	}

	private static String sanitize(String filename) {
		return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
	}

	@Override
	public String toString() {
		return value;
	}
}
