package com.ghemit.platform.shared.infrastructure.in.web;

import com.ghemit.platform.media.application.port.out.StorageUnavailableException;
import com.ghemit.platform.media.application.port.out.StoredObjectNotFoundException;
import com.ghemit.platform.media.domain.DocumentTooLargeException;
import com.ghemit.platform.media.domain.UnsupportedDocumentFormatException;
import com.ghemit.platform.shared.domain.BusinessRuleViolationException;
import com.ghemit.platform.shared.domain.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Traduit les erreurs métier en réponses HTTP. C'est le seul endroit qui connaît
 * cette correspondance : le domaine et les cas d'usage ignorent HTTP.
 */
@RestControllerAdvice
public class RestExceptionHandler {

	@ExceptionHandler(EntityNotFoundException.class)
	ProblemDetail handleNotFound(EntityNotFoundException e) {
		return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
	}

	@ExceptionHandler(BusinessRuleViolationException.class)
	ProblemDetail handleBusinessRule(BusinessRuleViolationException e) {
		return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage());
	}

	@ExceptionHandler(UnsupportedDocumentFormatException.class)
	ProblemDetail handleUnsupportedFormat(UnsupportedDocumentFormatException e) {
		return ProblemDetail.forStatusAndDetail(HttpStatus.UNSUPPORTED_MEDIA_TYPE, e.getMessage());
	}

	@ExceptionHandler(DocumentTooLargeException.class)
	ProblemDetail handleTooLarge(DocumentTooLargeException e) {
		return ProblemDetail.forStatusAndDetail(HttpStatus.CONTENT_TOO_LARGE, e.getMessage());
	}

	@ExceptionHandler(StoredObjectNotFoundException.class)
	ProblemDetail handleStoredObjectNotFound(StoredObjectNotFoundException e) {
		return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
	}

	@ExceptionHandler(StorageUnavailableException.class)
	ProblemDetail handleStorageUnavailable(StorageUnavailableException e) {
		return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_GATEWAY, e.getMessage());
	}
}
