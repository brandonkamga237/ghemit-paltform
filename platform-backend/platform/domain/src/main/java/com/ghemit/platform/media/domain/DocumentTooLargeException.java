package com.ghemit.platform.media.domain;

import com.ghemit.platform.shared.domain.DomainException;

/** Le document dépasse la taille autorisée. */
public class DocumentTooLargeException extends DomainException {

	public DocumentTooLargeException(String message) {
		super(message);
	}
}
