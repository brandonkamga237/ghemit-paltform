package com.ghemit.platform.content;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ContentType {
	PROGRAM("programs"),
	FORMATION("formations"),
	CALENDAR_ROW("calendar-rows"),
	ARTICLE("articles"),
	FAQ("faq"),
	PARTNER("partners"),
	STAT("stats"),
	ACHIEVEMENT("achievements"),
	SETTING("settings");

	private final String path;

	ContentType(String path) {
		this.path = path;
	}

	@JsonValue
	public String path() {
		return path;
	}

	public static ContentType fromPath(String path) {
		for (ContentType t : values()) {
			if (t.path.equalsIgnoreCase(path) || t.name().equalsIgnoreCase(path)) {
				return t;
			}
		}
		throw new IllegalArgumentException("Type de contenu inconnu : " + path);
	}
}
