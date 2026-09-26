package com.ghemit.platform.media.application.port.out;

/** Le stockage d'objets n'a pas pu être joint. */
public class StorageUnavailableException extends RuntimeException {

	public StorageUnavailableException(String message, Throwable cause) {
		super(message, cause);
	}
}
