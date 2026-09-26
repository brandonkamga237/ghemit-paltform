package com.ghemit.platform.media.domain;

import java.util.Locale;

/** Règles d'acceptation d'un CV joint à une candidature : PDF uniquement, 2 Mo maximum. */
public final class CvUploadPolicy {

	public static final long MAX_SIZE_BYTES = 2L * 1024 * 1024;
	public static final String PDF_CONTENT_TYPE = "application/pdf";

	private CvUploadPolicy() {
	}

	public static void check(String filename, String contentType, long size) {
		if (!looksLikePdf(filename, contentType)) {
			throw new UnsupportedDocumentFormatException("Seuls les fichiers PDF sont acceptés");
		}
		if (size > MAX_SIZE_BYTES) {
			throw new DocumentTooLargeException("Le fichier dépasse 2 Mo");
		}
	}

	private static boolean looksLikePdf(String filename, String contentType) {
		return PDF_CONTENT_TYPE.equalsIgnoreCase(contentType)
				|| (filename != null && filename.toLowerCase(Locale.ROOT).endsWith(".pdf"));
	}
}
