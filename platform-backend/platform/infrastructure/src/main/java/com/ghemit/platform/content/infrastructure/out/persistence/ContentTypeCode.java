package com.ghemit.platform.content.infrastructure.out.persistence;

import com.ghemit.platform.content.domain.ContentType;

/**
 * Codes stockés en base pour {@link ContentType}. Ce doublon isole le schéma des
 * renommages du domaine : les valeurs présentes en base ne doivent jamais bouger.
 */
public enum ContentTypeCode {
	PROGRAM,
	FORMATION,
	CALENDAR_ROW,
	ARTICLE,
	FAQ,
	PARTNER,
	STAT,
	ACHIEVEMENT,
	SETTING;

	public static ContentTypeCode of(ContentType type) {
		return valueOf(type.name());
	}

	public ContentType toDomain() {
		return ContentType.valueOf(name());
	}
}
