package com.ghemit.platform.media.application;

import com.ghemit.platform.media.application.port.in.CvUploaded;
import com.ghemit.platform.media.application.port.in.DownloadMediaQuery;
import com.ghemit.platform.media.application.port.in.MediaDownload;
import com.ghemit.platform.media.application.port.in.UploadCvUseCase;
import com.ghemit.platform.media.application.port.out.FileStorage;
import com.ghemit.platform.media.domain.CvUploadPolicy;
import com.ghemit.platform.media.domain.MediaFile;
import com.ghemit.platform.media.domain.MediaFileRepository;
import com.ghemit.platform.media.domain.ObjectKey;
import com.ghemit.platform.shared.application.BinaryContent;

/**
 * Dépôt d'un CV et diffusion des médias. Un CV n'entre pas dans la médiathèque :
 * il est stocké sous son propre préfixe et référencé par la candidature.
 */
public class CvUploadService implements UploadCvUseCase, DownloadMediaQuery {

	private static final String DEFAULT_CV_FILENAME = "cv.pdf";
	private static final String DEFAULT_CONTENT_TYPE = "application/octet-stream";

	private final FileStorage storage;
	private final MediaFileRepository repository;

	public CvUploadService(FileStorage storage, MediaFileRepository repository) {
		this.storage = storage;
		this.repository = repository;
	}

	@Override
	public CvUploaded upload(BinaryContent content) {
		String filename = content.filename() == null || content.filename().isBlank()
				? DEFAULT_CV_FILENAME
				: content.filename();
		CvUploadPolicy.check(filename, content.contentType(), content.size());
		ObjectKey key = ObjectKey.forCv(filename);
		storage.put(key, content.stream(), content.size(), content.contentType());
		return new CvUploaded(key, filename);
	}

	@Override
	public MediaDownload download(ObjectKey key) {
		String contentType = repository.findByObjectKey(key)
				.map(MediaFile::contentType)
				.orElseGet(() -> key.isCv() ? CvUploadPolicy.PDF_CONTENT_TYPE : DEFAULT_CONTENT_TYPE);
		return new MediaDownload(contentType, storage.get(key));
	}
}
