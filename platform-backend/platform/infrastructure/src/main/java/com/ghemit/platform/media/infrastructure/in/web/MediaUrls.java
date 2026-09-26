package com.ghemit.platform.media.infrastructure.in.web;

import com.ghemit.platform.media.domain.ObjectKey;

/** L'URL publique d'un média est une notion d'API : elle est construite ici. */
final class MediaUrls {

	static final String PUBLIC_MEDIA_PATH = "/api/public/media/";

	private MediaUrls() {
	}

	static String of(ObjectKey key) {
		return PUBLIC_MEDIA_PATH + key.value();
	}
}
