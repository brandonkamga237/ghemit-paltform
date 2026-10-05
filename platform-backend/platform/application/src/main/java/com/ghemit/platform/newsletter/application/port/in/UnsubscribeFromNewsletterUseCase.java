package com.ghemit.platform.newsletter.application.port.in;

/** Désinscription : l'abonné est conservé mais désactivé. */
public interface UnsubscribeFromNewsletterUseCase {

	void unsubscribe(String email);

	/** Lien signé des e-mails : @return true si le token est valide. */
	boolean unsubscribeToken(String token);
}
