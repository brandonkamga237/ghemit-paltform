package com.ghemit.platform.newsletter.application.port.in;

import com.ghemit.platform.newsletter.domain.Subscriber;

/** Inscription à la newsletter, idempotente sur l'adresse e-mail. */
public interface SubscribeToNewsletterUseCase {

	Subscriber subscribe(SubscribeCommand command);
}
