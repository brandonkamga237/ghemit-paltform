package com.ghemit.platform.shared.domain;

/** Racine des erreurs métier. Traduite en réponse HTTP par la couche infrastructure. */
public abstract class DomainException extends RuntimeException {

	protected DomainException(String message) {
		super(message);
	}
}
