package com.ghemit.platform.content.domain;

import com.ghemit.platform.shared.domain.BusinessRuleViolationException;

/** Famille de contenu éditorial. Le « path » est le terme utilisé par l'API et le back office. */
public enum ContentType {
	PROGRAM("programs"),
	FORMATION("formations"),
	ARTICLE("articles"),
	PARTNER("partners"),
	// Stockage interne (ex. dossiers de la médiathèque), pas un écran d'administration.
	SETTING("settings");

	private final String path;

	ContentType(String path) {
		this.path = path;
	}

	public String path() {
		return path;
	}

	public static ContentType fromPath(String path) {
		for (ContentType type : values()) {
			if (type.path.equalsIgnoreCase(path) || type.name().equalsIgnoreCase(path)) {
				return type;
			}
		}
		throw new BusinessRuleViolationException("Type de contenu inconnu : " + path);
	}
}
