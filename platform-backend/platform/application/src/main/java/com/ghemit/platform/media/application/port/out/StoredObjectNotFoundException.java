package com.ghemit.platform.media.application.port.out;

/** Aucun objet ne correspond à la clé demandée. */
public class StoredObjectNotFoundException extends RuntimeException {

	public StoredObjectNotFoundException(String message, Throwable cause) {
		super(message, cause);
	}
}
