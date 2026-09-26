package com.ghemit.platform.newsletter.application.port.out;

/** L'envoi vers un destinataire a échoué ; les autres destinataires restent servis. */
public class MailDeliveryException extends RuntimeException {

	public MailDeliveryException(String message, Throwable cause) {
		super(message, cause);
	}
}
