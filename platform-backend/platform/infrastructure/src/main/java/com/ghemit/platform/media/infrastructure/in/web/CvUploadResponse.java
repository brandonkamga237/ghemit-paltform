package com.ghemit.platform.media.infrastructure.in.web;

import com.ghemit.platform.media.application.port.in.CvUploaded;

public record CvUploadResponse(String objectKey, String url, String filename) {

	public static CvUploadResponse from(CvUploaded uploaded) {
		return new CvUploadResponse(uploaded.objectKey().value(), MediaUrls.of(uploaded.objectKey()),
				uploaded.filename());
	}
}
