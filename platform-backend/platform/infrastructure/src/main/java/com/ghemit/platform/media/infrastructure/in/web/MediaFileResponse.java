package com.ghemit.platform.media.infrastructure.in.web;

import com.ghemit.platform.media.domain.MediaFile;
import java.time.Instant;
import java.util.UUID;

public record MediaFileResponse(UUID id, String objectKey, String filename, String contentType,
		String folder, long size, Instant createdAt, String url) {

	public static MediaFileResponse from(MediaFile media) {
		return new MediaFileResponse(media.id().value(), media.objectKey().value(), media.filename(),
				media.contentType(), media.folder().name(), media.size(), media.createdAt(),
				MediaUrls.of(media.objectKey()));
	}
}
