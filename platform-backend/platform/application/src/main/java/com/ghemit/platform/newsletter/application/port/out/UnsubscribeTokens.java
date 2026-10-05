package com.ghemit.platform.newsletter.application.port.out;

import com.ghemit.platform.shared.domain.EmailAddress;
import java.util.Optional;

/** Liens de désinscription signés : impossible de désinscrire quelqu'un d'autre. */
public interface UnsubscribeTokens {

	String tokenFor(EmailAddress email);

	Optional<EmailAddress> verify(String token);
}
