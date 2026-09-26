package com.ghemit.platform.shared.domain;

/** L'agrégat demandé n'existe pas. */
public class EntityNotFoundException extends DomainException {

	public EntityNotFoundException(String message) {
		super(message);
	}
}
