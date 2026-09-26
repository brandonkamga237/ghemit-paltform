package com.ghemit.platform.media.application.port.in;

import com.ghemit.platform.shared.application.BinaryContent;

/** Dépôt du CV joint à une candidature, depuis le site public. */
public interface UploadCvUseCase {

	CvUploaded upload(BinaryContent content);
}
