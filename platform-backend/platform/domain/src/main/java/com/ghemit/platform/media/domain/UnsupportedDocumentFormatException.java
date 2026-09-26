package com.ghemit.platform.media.domain;

import com.ghemit.platform.shared.domain.DomainException;

/** Le format du document n'est pas accepté. */
public class UnsupportedDocumentFormatException extends DomainException {

	public UnsupportedDocumentFormatException(String message) {
		super(message);
	}
}
